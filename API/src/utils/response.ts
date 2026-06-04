import { Response } from "express";

// Criamos uma interface simples para blindar o objeto de paginação
interface Pagination {
  page: number;
  limit: number;
  total: number;
}

/**
 * Consistent API response helpers.
 * All responses follow: { data?, error?, meta? }
 */

// 🌟 CORREÇÃO: Adicionado o parâmetro 'status' vindo por padrão como 200
export function success(res: Response, data: any, meta?: any, status = 200) {
  const body: { data: any; meta?: any } = { data };
  
  if (meta) body.meta = meta;
  
  return res.status(status).json(body);
}

export function created(res: Response, data: any) {
  // Mudamos de null para undefined para casar perfeitamente com o meta?: any
  return success(res, data, undefined, 201);
}

export function noContent(res: Response) {
  return res.status(204).send();
}

export function paginated(res: Response, data: any, pagination: Pagination) {
  return success(res, data, {
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    totalPages: Math.ceil(pagination.total / pagination.limit),
  });
}