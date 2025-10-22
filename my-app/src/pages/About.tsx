import { Link } from "react-router-dom";

function About() {
  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>О нас</h1>
      <p>Разработчик Бабиченко Максим Эдуардович</p>
      <p>
        <Link to="/">Назад на главную</Link>
      </p>
    </div>
  );
}

export default About;
