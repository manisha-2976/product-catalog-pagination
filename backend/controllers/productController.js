const mongoose = require('mongoose');
const Product = require('../models/products');
const { encodeCursor, decodeCursor } = require('../utils/cursor');

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const getLimit = (value) => {
    const limit = Number(value) || DEFAULT_LIMIT;
    return Math.min(Math.max(limit, 1), MAX_LIMIT);
};

const isValidCursorDate = (value) => {
    return value && !Number.isNaN(new Date(value).getTime());
};

const isValidCursorId = (value) => {
    return mongoose.Types.ObjectId.isValid(value);
};

const formatProduct = (product) => {
    return {
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        created_at: product.created_at,
        updated_at: product.updated_at,
    };
};

const buildSnapshotFilter = (snapshot) => {
    const snapshotDate = new Date(snapshot.created_at);
    const snapshotId = new mongoose.Types.ObjectId(snapshot._id);

    return {
        $or: [
            { created_at: { $lt: snapshotDate } },
            { created_at: snapshotDate, _id: { $lte: snapshotId } },
        ],
    };
};

const buildCursorFilter = (cursor) => {
    const cursorDate = new Date(cursor.created_at);
    const cursorId = new mongoose.Types.ObjectId(cursor._id);

    return {
        $or: [
            { created_at: { $lt: cursorDate } },
            { created_at: cursorDate, _id: { $lt: cursorId } },
        ],
    };
};

const createNextCursor = (lastProduct, snapshot, category) => {
    return encodeCursor({
        _id: lastProduct._id.toString(),
        created_at: lastProduct.created_at.toISOString(),
        snapshot,
        category: category || null,
    });
};

const getProducts = async (req, res, next) => {
    try {
        const limit = getLimit(req.query.limit);
        const category = req.query.category ? req.query.category.trim() : '';
        const filters = [];
        const baseFilter = {};

        if (category) {
            baseFilter.category = category;
        }

        let cursorData = null;
        let snapshot = null;

        if (req.query.cursor) {
            cursorData = decodeCursor(req.query.cursor);

            if (
                !cursorData
                || !cursorData.snapshot
                || !isValidCursorId(cursorData._id)
                || !isValidCursorDate(cursorData.created_at)
                || !isValidCursorId(cursorData.snapshot._id)
                || !isValidCursorDate(cursorData.snapshot.created_at)
            ) {
                return res.status(400).json({ message: 'Invalid cursor' });
            }

            if ((cursorData.category || '') !== (category || '')) {
                return res.status(400).json({ message: 'Cursor does not match the selected category' });
            }

            snapshot = cursorData.snapshot;
            filters.push(buildCursorFilter(cursorData));
        } else {
            const newestProduct = await Product.findOne(baseFilter)
                .sort({ created_at: -1, _id: -1 })
                .select({ created_at: 1 })
                .lean();

            if (!newestProduct) {
                return res.json({
                    data: [],
                    pagination: {
                        limit,
                        has_next_page: false,
                        next_cursor: null,
                    },
                });
            }

            snapshot = {
                _id: newestProduct._id.toString(),
                created_at: newestProduct.created_at.toISOString(),
            };
        }

        filters.push(buildSnapshotFilter(snapshot));

        const query = filters.length > 0
            ? { ...baseFilter, $and: filters }
            : baseFilter;

        const products = await Product.find(query)
            .sort({ created_at: -1, _id: -1 })
            .limit(limit + 1)
            .lean();

        const hasNextPage = products.length > limit;
        const currentPageProducts = products.slice(0, limit);
        const lastProduct = currentPageProducts[currentPageProducts.length - 1];

        res.json({
            data: currentPageProducts.map(formatProduct),
            pagination: {
                limit,
                has_next_page: hasNextPage,
                next_cursor: hasNextPage ? createNextCursor(lastProduct, snapshot, category) : null,
            },
        });
    } catch (error) {
        next(error);
    }
};

const getCategories = async (req, res, next) => {
    try {
        const categories = await Product.distinct('category');
        res.json({ data: categories.sort() });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProducts,
    getCategories,
};
