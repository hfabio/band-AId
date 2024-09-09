import {Router} from 'express';
import multer from 'multer';
import examController from './exams/controller';
const router = Router();
const upload = multer();

router
  .all('/exam', async (req, res, next) => {
    console.log('exams route requested', req.requestUuid);
    next()
  })
  .get('/exam', (req, res, next) => {
    res.send('test')
  })
  .post('/exam', upload.single('image'), examController.verifyExam);

export default router;