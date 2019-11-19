import { parseISO, isBefore } from 'date-fns';
import addMonths from 'date-fns/addMonths';

import Registration from '../models/Registration';
import Plan from '../models/Plan';
import Student from '../models/Student';

import RegistrationMail from '../jobs/RegistrationMail';
import AlterPlanMail from '../jobs/AlterPlanMail';
import Queue from '../../lib/Queue';

class RegistrationController {
  async index(req, res) {
    const registers = await Registration.findAll({
      attributes: ['student_id', 'plan_id', 'start_date', 'end_date', 'price'],
    });

    return res.json(registers);
  }

  async store(req, res) {
    // student_id plan_id start_date end_date price
    const { student_id, plan_id, start_date } = req.body;

    const student = await Student.findOne({ where: { id: student_id } });

    const plan = await Plan.findOne({ where: { id: plan_id } });

    if (!plan) {
      return res.status(401).json({ error: 'Nothing plan registered. ' });
    }

    const newStartDate = parseISO(start_date);

    if (isBefore(newStartDate, new Date())) {
      return res.status(400).json({ error: 'Past date is not permitted' });
    }

    const end_date = addMonths(newStartDate, plan.duration);

    // const newPrice = parseFloat(plan.price);

    const register = await Registration.create({
      student_id: student.id,
      plan_id: plan.id,
      start_date: newStartDate,
      end_date,
      price: plan.price * plan.duration,
    });

    await Queue.add(RegistrationMail.key, { register, plan, student });

    return res.json(register);
  }

  async update(req, res) {
    const { plan_id, start_date } = req.body;

    if (isBefore(parseISO(start_date), new Date())) {
      return res.status(400).json({ error: 'Past date are not permitted' });
    }

    const register = await Registration.findByPk(req.body.id);
    const plan = await Plan.findOne({ where: { id: req.body.plan_id } });

    const updatePlanPrice = plan.price * plan.duration;

    const student = await Student.findOne({
      where: { id: register.student_id },
    });

    const updatedRegistration = await register.update({
      student_id: student.id,
      plan_id,
      start_date: parseISO(start_date),
      end_date: addMonths(parseISO(start_date), plan.duration),
      price: updatePlanPrice,
    });

    await Queue.add(AlterPlanMail.key, {
      updatedRegistration,
      plan,
      student,
    });

    return res.json(updatedRegistration);
  }

  async delete(req, res) {
    const matricullation = await Registration.findByPk(req.body.id);

    if (!matricullation) {
      return res.status(401).json({ error: 'Matricullation not found' });
    }

    await matricullation.destroy();

    return res.json('Register deleted with success!');
  }
}

export default new RegistrationController();
