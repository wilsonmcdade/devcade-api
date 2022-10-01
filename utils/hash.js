const argon2 = require("argon2");

/**
 * Verifies a user's password for authentication
 * @param {String} userId: User identifier (name or password).
 * @param {String} password: User's entered password.
 */
const verifyPassword = async (storedHash, passwordToVerify) => {
    try {
        return await argon2.verify(storedHash, passwordToVerify);
    } catch (err) {
        throw new Error("Failed to verify password. Please contact system administrator.");
    }
};


/**
 * Async function that hashes a password using the Argon2id hashing algorithm.
 * @param {String} password
 * @returns Promise with Argon2id hash of password, or throws exception on error.
 */
const hashPassword = async (password) => {
    try {
        const hashPromise = await argon2.hash(password, { 
            type: argon2.argon2id,
            hashLength: 64
        });
        return hashPromise;
    } catch (err) {
        throw new Error("Failed to hash password. Please contact system administrator.");
    }
}

module.exports = {
    verifyPassword,
    hashPassword
}