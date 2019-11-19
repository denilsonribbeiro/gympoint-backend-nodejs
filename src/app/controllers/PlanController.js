import * as Yup from 'yup';
import Plan from '../models/Plan';

class PlanController {
  async index(req, res) {
    const plans = await Plan.findAll();

    return res.json(plans);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.string().required(),
      price: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const planExists = await Plan.findOne({
      where: { title: req.body.title },
      attributes: ['id', 'title', 'duration', 'price'],
    });

    if (planExists) {
      return res
        .status(401)
        .json({ error: 'Plan already exists, please verify.' });
    }

    const { id, title, duration, price } = await Plan.create(req.body);

    return res.json({ id, title, duration, price });
  }

  async update(req, res) {
    const plan = await Plan.findByPk(req.body.id);

    const { title, duration, price } = await plan.update(req.body);

    return res.json({ title, duration, price });
  }

  async delete(req, res) {
    const isPlan = await Plan.findByPk(req.params.id);

    if (!isPlan) {
      return res
        .status(401)
        .json({ error: 'Not is possible exclude this plan.' });
    }

    await isPlan.destroy();

    return res.json({
      message: `Plan ${isPlan.title} excluded with successful!`,
    });
  }
}

export default new PlanController();
