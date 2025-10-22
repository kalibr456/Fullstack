import { Link } from "react-router-dom";

function Register() {
  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Регистрация</h1>
      <form style={{ marginTop: "1rem" }}>
        <input type="text" placeholder="Имя" /><br /><br />
        <input type="email" placeholder="Email" /><br /><br />
        <input type="password" placeholder="Пароль" /><br /><br />
        <button type="submit">Зарегистрироваться</button>
      </form>
      <p>
        <Link to="/">Назад на главную</Link>
      </p>
    </div>
  );
}

export default Register;
