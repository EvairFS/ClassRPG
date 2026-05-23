/**
 * Consistent API response helpers.
 * All responses follow: { data?, error?, meta? }
 */

export function success(res, data, meta, status = 200) {
  const body = { data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
}

export function created(res, data) {
  return success(res, data, null, 201);
}

export function noContent(res) {
  return res.status(204).send();
}

export function paginated(res, data, pagination) {
  return success(res, data, {
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    totalPages: Math.ceil(pagination.total / pagination.limit),
  });
}