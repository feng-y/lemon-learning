/* Display planning inputs without turning them into new tasks.
   sessionDate and lemon:datechange belong to task-ruler.js; there is no new date store.
   Lesson facts come from the same LemonSchedule used by learning-guide.js. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const input = $('sessionDate');
  if (!input || !$('backgroundDays')) return;
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const dateString = d => [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
  function parse(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
    const d = new Date(value + 'T12:00:00');
    return Number.isFinite(d.getTime()) && dateString(d) === value ? d : null;
  }
  const index = d => (d.getDay() + 6) % 7;
  function offset(d, amount) {
    const copy = new Date(d.getTime());
    copy.setDate(copy.getDate() + amount);
    return copy;
  }
  function choose(value) {
    if (!parse(value)) return;
    if (input.value !== value) {
      input.value = value;
      // The existing handler saves the old day's draft, loads the new day,
      // and emits lemon:datechange for both this panel and curriculum guidance.
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
    render();
  }
  function render() {
    const selected = parse(input.value);
    if (!selected) return;
    const weekday = index(selected);
    const monday = offset(selected, -weekday);
    const schedule = window.LemonSchedule || {};
    const school = schedule.schoolTimetable || [];
    const extras = schedule.extraClassSchedule || {};
    $('backgroundWeekLabel').textContent = dateString(monday) + ' ～ ' + dateString(offset(monday, 6));
    const buttons = [];
    for (let i = 0; i < 7; i++) {
      const d = offset(monday, i), value = dateString(d);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'background-day';
      button.dataset.date = value;
      button.setAttribute('aria-pressed', String(value === input.value));
      const classes = extras[i] || [];
      button.setAttribute('aria-label', value + ' ' + days[i] + (classes.length ? '，' + classes.length + '节课外课' : ''));
      const label = document.createElement('span'); label.textContent = days[i];
      const number = document.createElement('strong'); number.textContent = String(d.getDate());
      const flag = document.createElement('small'); flag.textContent = classes.length ? '课外' + classes.length : '\u00a0';
      button.append(label, number, flag);
      button.addEventListener('click', () => choose(value));
      buttons.push(button);
    }
    $('backgroundDays').replaceChildren(...buttons);
    const lessons = school[weekday] || [];
    $('backgroundSchoolTitle').textContent = days[weekday] + (lessons.length ? ' · 校内' + lessons.length + '节课' : ' · 无校内课表');
    $('backgroundSchoolLessons').replaceChildren(...lessons.map((subject, i) => {
      const li = document.createElement('li');
      const n = document.createElement('small'); n.textContent = '第' + (i + 1) + '节';
      const text = document.createElement('span'); text.textContent = subject;
      li.append(n, text);
      return li;
    }));
    $('backgroundSchoolNote').textContent = lessons.length
      ? '核对老师实际布置的作业。上课不等于新增练习。'
      : '周末无校内课表，不代表没有已有作业或课外课程。';
    const classes = extras[weekday] || [];
    const rows = classes.map(c => {
      const line = document.createElement('p'); line.className = 'background-class';
      const period = document.createElement('strong'); period.textContent = c.period;
      const subject = document.createElement('span'); subject.textContent = c.subject;
      line.append(period, subject);
      return line;
    });
    if (!rows.length) {
      const empty = document.createElement('p'); empty.className = 'note';
      empty.textContent = '当天无已登记的固定课外课。'; rows.push(empty);
    }
    $('backgroundExtraClasses').replaceChildren(...rows);
  }
  $('backgroundPrev').addEventListener('click', () => {
    const current = parse(input.value); if (current) choose(dateString(offset(current, -7)));
  });
  $('backgroundNext').addEventListener('click', () => {
    const current = parse(input.value); if (current) choose(dateString(offset(current, 7)));
  });
  $('backgroundToday').addEventListener('click', () => choose(dateString(new Date())));
  input.addEventListener('change', render);
  window.addEventListener('lemon:datechange', render);
  render();
})();
