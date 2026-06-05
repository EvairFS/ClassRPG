// student.controller.ts
export async function getStudentProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const profile = await studentService.getStudentProfile(req.user?.id);
    res.json({ status: 'success', data: profile });
  } catch (error) {
    next(error);
  }
}