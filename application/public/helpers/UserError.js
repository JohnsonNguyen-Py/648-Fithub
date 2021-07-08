//WILL THROW ERRORS

class UserError extends Error {
    constructor(message, redirectURL, status) {
        super(message);
        this.redirectURL = redirectURL;
        this.status = status;
    }

    getMessage() {
        return this.message;
    }
}

module.exports = UserError;