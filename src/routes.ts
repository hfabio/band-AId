import {Router} from 'express';
import multer from 'multer';
import examController from './exams/controller';
const router = Router();
const upload = multer({
  limits: {
    fieldSize: 50 * 1024 * 1024
  }
});

router
  .all('/exam', async (req, res, next) => {
    console.log('exams route requested', req.requestUuid);
    next()
  })
  .get('/exam', async (req, res, next) => {
    setTimeout(() => {
      res.send('test')
    }, 5000);
  })
  .post('/exam', upload.single('image'), examController.verifyExam);

export default router;