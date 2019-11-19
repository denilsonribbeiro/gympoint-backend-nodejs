import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Mail from '../../lib/Mail';

class RegistrationMail {
  get key() {
    return 'RegistrationMail';
  }

  async handle({ data }) {
    const { student, plan, register } = data;

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Matrícula realizada na Gympoint',
      template: 'registration',
      context: {
        student: student.name,
        plan: plan.title,
        duration: `${plan.duration} mês/meses`,
        start_date: format(
          parseISO(register.start_date),
          "'dia' dd 'de' MMMM de yyyy', às' H:mm'h'",
          { locale: pt }
        ),
        end_date: format(
          parseISO(register.end_date),
          "'dia' dd 'de' MMMM de yyyy', às' H:mm'h'",
          { locale: pt }
        ),
        price: `R$ ${register.price}`,
      },
    });

    console.log(Mail.sendMail());
  }
}

export default new RegistrationMail();
