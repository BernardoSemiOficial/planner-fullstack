import dayjs from "dayjs";
import ptBR from "dayjs/locale/pt-br";
import LocalizedFormat from "dayjs/plugin/localizedFormat";

dayjs.locale(ptBR);
dayjs.extend(LocalizedFormat);

export { dayjs };
