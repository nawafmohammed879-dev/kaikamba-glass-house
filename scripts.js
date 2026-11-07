(function () {
  'use strict';

  var TO = 'kaikambaglasshouse@gmail.com';
  var PHONE_DISPLAY = '89041 55719';
  var PHONE_LINK = 'tel:+918904155719';

  var form = document.getElementById('quote');
  var note = document.getElementById('note');
  var opts = document.getElementById('opts');
  if (!form || !note || !opts) { return; }

  function makeLink(text, href, newTab) {
    var a = document.createElement('a');
    a.textContent = text;
    a.href = href;
    if (newTab) {
      a.target = '_blank';
      a.rel = 'noopener';
    }
    return a;
  }

  function copyText(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      }
    } catch (err) { /* fall through to the older method */ }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        if (ok) { resolve(); } else { reject(new Error('copy failed')); }
      } catch (err) {
        reject(err);
      }
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = document.getElementById('n').value.trim();
    var phone = document.getElementById('p').value.trim();
    var need = document.getElementById('m').value.trim();
    var subject = 'Enquiry from ' + name;
    var body = 'Hello Kaikamba Glass House,\n\nName: ' + name + '\nPhone: ' + phone + '\n\n' + need;

    var mailto = 'mailto:' + TO + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    var gmail = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(TO) +
      '&su=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

    function showOptions() {
      opts.textContent = '';
      opts.appendChild(makeLink('Open in email app', mailto, false));
      opts.appendChild(makeLink('Open in Gmail', gmail, true));

      var copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.textContent = 'Copy message';
      copyBtn.addEventListener('click', function () {
        copyText(body).then(function () {
          note.textContent = 'Message copied. Paste it into any app and send it to ' + TO + ' or call ' + PHONE_DISPLAY + '.';
        }, function () {
          note.textContent = 'Could not copy. Please call ' + PHONE_DISPLAY + ' instead.';
        });
      });
      opts.appendChild(copyBtn);

      opts.appendChild(makeLink('Call the shop', PHONE_LINK, false));
      opts.hidden = false;
      note.textContent = 'Could not send automatically. Choose an option below, or call us.';
    }

    var submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    note.textContent = 'Sending your enquiry...';
    opts.hidden = true;

    var controller = ('AbortController' in window) ? new AbortController() : null;
    var timer = setTimeout(function () {
      if (controller) { controller.abort(); }
    }, 10000);

    fetch('https://formsubmit.co/ajax/' + TO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ name: name, phone: phone, message: need, _subject: subject, _captcha: 'false' }),
      signal: controller ? controller.signal : undefined
    })
      .then(function (r) {
        return r.json().then(function (d) { return { ok: r.ok, data: d }; });
      })
      .then(function (res) {
        clearTimeout(timer);
        submitBtn.disabled = false;
        if (res.ok && String(res.data.success) === 'true') {
          form.reset();
          opts.hidden = true;
          note.textContent = 'Thank you. Your enquiry has been sent. We will call you back.';
        } else {
          showOptions();
        }
      })
      .catch(function () {
        clearTimeout(timer);
        submitBtn.disabled = false;
        showOptions();
      });
  });
})();