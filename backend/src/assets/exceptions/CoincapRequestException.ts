import HttpException from "./HttpException";

class CoincapRequestException extends HttpException {
  constructor(message: string) {
    super(404, "Could not fetch results from the coincap API; error message received:" + message);
  }
}

export default CoincapRequestException;