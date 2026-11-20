const students = [
  ['Aditi Rao', 'DEMO-001', 'B.Tech', 'CSE', '3'],
  ['Ishan Mehta', 'DEMO-002', 'B.Tech', 'ECE', '2'],
  ['Kavya Das', 'DEMO-003', 'B.Tech', 'CSE', '4'],
  ['Rohan Sen', 'DEMO-004', 'B.Tech', 'ECE', '1'],
];
const payments = [
  ['Kavya Das', 'PAY-DEMO-104', 12500, '19 Nov 2026'],
  ['Aditi Rao', 'PAY-DEMO-103', 8000, '18 Nov 2026'],
  ['Rohan Sen', 'PAY-DEMO-102', 10000, '16 Nov 2026'],
  ['Ishan Mehta', 'PAY-DEMO-101', 6500, '11 Nov 2026'],
];
const currency = new Intl.NumberFormat('en-IN', {style:'currency',currency:'INR',minimumFractionDigits:0,maximumFractionDigits:2});
function rows(target, values, width) {
  const output = values.map(values => {
    const row = document.createElement('tr');
    for (const value of values) row.insertCell().textContent = value;
    return row;
  });
  if (!output.length) {
    const row = document.createElement('tr');
    const cell = row.insertCell();
    cell.colSpan = width;
    cell.textContent = 'No matching records.';
    output.push(row);
  }
  target.replaceChildren(...output);
}
const search = (record, term) => record.slice(0, 2).join(' ').toLowerCase().includes(term.trim().toLowerCase());
function render() {
  document.querySelector('#count').textContent = students.length;
  document.querySelector('#total').textContent = currency.format(payments.reduce((sum, row) => sum + row[2], 0));
  const studentSelect = document.querySelector('#payment-student');
  const selected = studentSelect.value;
  studentSelect.replaceChildren(...students.map(([name, admission]) => new Option(name + ' · ' + admission, admission)));
  if (selected) studentSelect.value = selected;

  const branch = document.querySelector('#student-branch').value;
  const studentQuery = document.querySelector('#student-query').value;
  const paymentQuery = document.querySelector('#payment-query').value;
  rows(document.querySelector('#student-rows'), students.filter(r => (!branch || r[3] === branch) && search(r, studentQuery)), 5);
  const format = list => list.map(([name, id, amount, date]) => [name, id, currency.format(amount), date]);
  rows(document.querySelector('#dashboard [data-payments]'), format(payments), 4);
  rows(document.querySelector('#fees [data-payments]'), format(payments.filter(r => search(r, paymentQuery))), 4);
}
function route() {
  const section = location.hash.slice(1);
  const active = ['students','fees'].includes(section) ? section : 'dashboard';
  document.querySelectorAll('main > section').forEach(page => page.hidden = page.id !== active);
  document.querySelectorAll('.demo-header nav a').forEach(link => {
    if (link.hash === '#' + active) link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  });
}
document.querySelectorAll('.filters input, .filters select').forEach(control => control.addEventListener('input', render));
document.querySelector('#add-student').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  const fields = new FormData(form);
  const name = fields.get('name').trim();
  const admission = fields.get('admission').trim().toUpperCase();
  const status = document.querySelector('#student-status');
  if (!name || !admission || students.some(row => row[1] === admission)) {
    status.textContent = 'Enter a name and a unique admission number.';
    return;
  }
  students.push([name, admission, 'B.Tech', fields.get('branch'), fields.get('year')]);
  form.reset();
  document.querySelector('#student-query').value = '';
  document.querySelector('#student-branch').value = '';
  status.textContent = 'Sample student added.';
  render();
});

document.querySelector('#add-payment').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  const fields = new FormData(form);
  const student = students.find(row => row[1] === fields.get('student'));
  const amount = Number(fields.get('amount'));
  const reference = fields.get('reference').trim().toUpperCase();
  const status = document.querySelector('#payment-status');
  if (!student || !Number.isFinite(amount) || amount <= 0 || !reference || payments.some(row => row[1] === reference)) {
    status.textContent = 'Select a student and enter a positive amount and unique reference.';
    return;
  }
  const date = new Date().toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'});
  payments.unshift([student[0], reference, amount, date]);
  form.reset();
  document.querySelector('#payment-query').value = '';
  status.textContent = 'Sample payment recorded.';
  render();
});

window.addEventListener('hashchange', route);
render();
route();
