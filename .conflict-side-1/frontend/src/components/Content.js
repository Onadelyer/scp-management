import React from 'react';
import '../styles/Content.css';

function Content() {
  return (
    <main className="content">
      <section id="about">
        <h2>Про нас</h2>
        <p>Ми займаємося зберіганням та дослідженням паранормальних явищ.</p>
      </section>
      <section id="services">
        <h2>Наші послуги</h2>
        <p>Безпечне зберігання та облік небезпечних об'єктів.</p>
      </section>
      <section id="contact">
        <h2>Контакти</h2>
        <p>Зв'яжіться з нами для отримання додаткової інформації.</p>
      </section>
    </main>
  );
}

export default Content;
