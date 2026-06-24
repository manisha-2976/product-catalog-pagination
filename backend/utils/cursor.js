const encodeCursor = (cursorData) => {
    return Buffer.from(JSON.stringify(cursorData)).toString('base64url');
};

const decodeCursor = (cursor) => {
    try {
        return JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
    } catch (error) {
        return null;
    }
};

module.exports = {
    encodeCursor,
    decodeCursor,
};
