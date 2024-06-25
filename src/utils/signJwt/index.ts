import jwt from 'jsonwebtoken';
import config from 'config';

// Asumiendo que 'privateKey' es una clave correctamente formateada en tu archivo de configuración
const privateKey: string = config.get<string>('privateKey');

// Función para firmar el JWT
const signJwt = (
  payload: jwt.JwtPayload,
  options?: jwt.SignOptions,
) => jwt.sign(payload, privateKey, {
  ...(options && options),
  algorithm: 'RS256',
});

export default signJwt;
