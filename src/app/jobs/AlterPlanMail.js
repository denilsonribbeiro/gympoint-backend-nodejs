import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Mail from '../../lib/Mail';

class AlterPlanMail {
  get key() {
    return 'AlterPlanMail';
  }

  async handle({ data }) {
    const { student, plan, updatedRegistration } = data;

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Você solicitou alteração no seu plano!',
      template: 'alterRegistration',
      context: {
        student: student.name,
        plan: plan.title,
        duration: `${plan.duration} mês/meses`,
        start_date: format(
          parseISO(updatedRegistration.start_date),
          "'dia' dd 'de' MMMM de yyyy', às' H:mm'h'",
          { locale: pt }
        ),
        end_date: format(
          parseISO(updatedRegistration.end_date),
          "'dia' dd 'de' MMMM de yyyy', às' H:mm'h'",
          { locale: pt }
        ),
        price: `R$ ${updatedRegistration.price}`,
      },
    });
  }
}

export default new AlterPlanMail();
