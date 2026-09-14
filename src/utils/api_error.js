class apiError extends Error{
    constructor(
        statusCode,
        message = "Something want wrong",
        errors = [],
        stack = ""
    ){
        super(message),
        this.statusCode = statusCode,
        this.data = null,
        this.errors = errors,
        this.message = message,
        this.success = success
        if(stack){
            this.stack = this.stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {apiError}