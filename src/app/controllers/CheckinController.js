import { format, isWithinInterval, isSameDay } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Checkin from '../models/Checkin';
import Registration from '../models/Registration';

class CheckinController {
  async index(req, res) {
    const listCheckins = await Checkin.findAll({
      where: { student_id: req.params.id },
    });

    return res.json(listCheckins);
  }

  async store(req, res) {
    const isStudentRegistered = await Registration.findOne({
      where: { student_id: req.params.id },
    });

    if (!isStudentRegistered) {
      return res
        .status(401)
        .json({ error: 'User not registered. Make your register.' });
    }

    if (
      !isWithinInterval(new Date(), {
        start: isStudentRegistered.start_date,
        end: isStudentRegistered.end_date,
      })
    ) {
      return res.json(
        format(
          new Date(),
          "'Dia ' dd ' de ' MMMM ' de ' yyyy', às ' H:mm'h is without of your plan. Please, verified with administrative team.'",
          { locale: pt }
        )
      );
    }

    const checkDiario = await Checkin.findOne({
      where: { student_id: req.params.id },
    });

    const verifyCkeckinDiario = isSameDay(new Date(), checkDiario.created_at);

    if (verifyCkeckinDiario === false) {
      return res.status(401).json({
        error:
          'You already do ckeckin in this day, you can do only one ckeckin per day.',
      });
    }

    const checkin = await Checkin.create(req.body);

    return res
      .status(200)
      .json({ checkin, message: 'Welcome! Good exercises' });
  }
}

export default new CheckinController();
