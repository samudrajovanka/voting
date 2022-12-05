import { METHOD_ERR_MSG } from '@/constants/errorMessage';
import { NOT_ALLOWED_ERR, SERVER_ERR } from '@/constants/errorType';
import ClientError from '@/exceptions/ClientError';
import InvariantError from '@/exceptions/InvariantError';

export const clientErrRes = (error) => ({
  success: false,
  message: error.message,
  type: error.type
});

export const serverErrRes = (error) => ({
  success: false,
  message: error.message,
  type: SERVER_ERR
});

// export const errorRes = (res: NextApiResponse, error: Error | ClientError) => {
//   if (error instanceof ClientError) {
//     return res.status(error.statusCode).json(clientErrRes(error));
//   }

//   return res.status(500).json(serverErrRes(error));
// };

// export const errorMethodNotAllowedRes = (res: NextApiResponse) => errorRes(
//   res,
//   new InvariantError(
//     METHOD_ERR_MSG,
//     NOT_ALLOWED_ERR,
//     405
//   )
// );
