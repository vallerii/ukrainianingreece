/* Тексти політики конфіденційності трьома мовами. Перед запуском — перевірка юристом. */
import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Controller } from "./page";

export type Section = { id: string; title: string; body: ReactNode };

const ukSections = (CONTROLLER: Controller): Section[] => [
  {
    id: "khto-my",
    title: "Хто відповідає за ваші дані",
    body: (
      <>
        <p>
          Контролер даних — {CONTROLLER.legalName || CONTROLLER.name}
          {CONTROLLER.regNumber && `, реєстраційний номер ${CONTROLLER.regNumber}`}, адреса: {CONTROLLER.address}.
        </p>
        <p>
          З усіх питань щодо персональних даних пишіть на{" "}
          <a href={`mailto:${CONTROLLER.email}`}>{CONTROLLER.email}</a>.
        </p>
      </>
    ),
  },
  {
    id: "yaki-dani",
    title: "Які дані ми отримуємо",
    body: (
      <>
        <p>Ми збираємо мінімум даних і лише тоді, коли ви самі щось робите на сайті:</p>
        <ul>
          <li>
            <strong>Перегляд сайту.</strong> Сервер хостингу автоматично фіксує технічні дані запиту: IP-адресу,
            тип браузера, час звернення. Ми не використовуємо рекламних чи аналітичних трекерів і не ставимо
            cookie для стеження.
          </li>
          <li>
            <strong>Донати.</strong> Оплата відбувається на захищеній сторінці Stripe. Ми отримуємо ваше ім’я,
            e-mail, суму й дату внеску. Дані банківської картки обробляє лише Stripe — ми їх не бачимо й не зберігаємо.
          </li>
          <li>
            <strong>Розсилка.</strong> Якщо ви підписалися на новини, ми зберігаємо ваш e-mail і дату підтвердження
            згоди.
          </li>
          <li>
            <strong>Листування.</strong> Коли ви пишете нам на пошту чи телефонуєте, ми бачимо ваші контакти та зміст
            звернення.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "navishcho",
    title: "Навіщо і на якій підставі",
    body: (
      <ul>
        <li>
          Робота сайту та його безпека — наш законний інтерес (ст. 6(1)(f) GDPR).
        </li>
        <li>
          Прийом донатів, надсилання квитанцій і бухгалтерський облік — виконання вашого запиту та юридичні
          обов’язки організації (ст. 6(1)(b), 6(1)(c) GDPR).
        </li>
        <li>Розсилка новин — ваша згода (ст. 6(1)(a) GDPR), яку можна відкликати будь-коли.</li>
        <li>Відповіді на звернення — ваш запит і наш законний інтерес допомогти.</li>
      </ul>
    ),
  },
  {
    id: "komu",
    title: "Кому ми передаємо дані",
    body: (
      <>
        <p>Ми не продаємо й не передаємо дані для реклами. Дані обробляють лише сервіси, без яких сайт не працює:</p>
        <ul>
          <li>
            <strong>Stripe</strong> — платежі (донати).
          </li>
          <li>
            <strong>Хостинг сайту</strong> — технічні журнали відвідувань.
          </li>
          <li>
            <strong>DatoCMS</strong> — система керування вмістом; зображення сайту завантажуються з її сервера.
          </li>
          <li>
            <strong>Сервіс розсилки</strong> — якщо ви підписалися на новини.
          </li>
          <li>
            <strong>OpenStreetMap</strong> — карта місця на сторінках подій завантажується з їхнього сервера.
          </li>
        </ul>
        <p>
          Деякі з цих сервісів можуть обробляти дані за межами ЄС. У таких випадках передача відбувається на підставі
          стандартних договірних положень Європейської комісії або рішення про належний рівень захисту.
        </p>
      </>
    ),
  },
  {
    id: "skilky",
    title: "Як довго зберігаємо",
    body: (
      <ul>
        <li>Дані про донати — стільки, скільки вимагає грецьке законодавство щодо бухгалтерського обліку.</li>
        <li>E-mail для розсилки — доки ви не відпишетеся.</li>
        <li>Листування — доки це потрібно для відповіді, але не довше двох років.</li>
        <li>Технічні журнали хостингу — згідно з налаштуваннями провайдера, зазвичай кілька тижнів.</li>
      </ul>
    ),
  },
  {
    id: "prava",
    title: "Ваші права",
    body: (
      <>
        <p>Відповідно до GDPR ви можете в будь-який момент:</p>
        <ul>
          <li>дізнатися, які ваші дані ми маємо, і отримати їх копію;</li>
          <li>виправити неточні дані;</li>
          <li>попросити видалити дані;</li>
          <li>обмежити обробку або заперечити проти неї;</li>
          <li>відкликати згоду на розсилку — посиланням «Відписатися» в кожному листі;</li>
          <li>отримати дані у зручному форматі для передачі іншій організації.</li>
        </ul>
        <p>
          Напишіть на <a href={`mailto:${CONTROLLER.email}`}>{CONTROLLER.email}</a> — відповімо протягом місяця.
          Якщо вважаєте, що ваші права порушено, ви можете поскаржитися до Грецького органу захисту персональних даних
          (Αρχή Προστασίας Δεδομένων Προσωπικού Χαρακτήρα) —{" "}
          <a href="https://www.dpa.gr" target="_blank" rel="noopener noreferrer">
            www.dpa.gr
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "zminy",
    title: "Зміни політики",
    body: (
      <p>
        Якщо ми змінимо цю політику, нова редакція з’явиться на цій сторінці з оновленою датою. Про суттєві зміни
        повідомимо підписників розсилки.
      </p>
    ),
  },
];

const enSections = (CONTROLLER: Controller): Section[] => [
  {
    id: "khto-my",
    title: "Who is responsible for your data",
    body: (
      <>
        <p>
          The data controller is {CONTROLLER.legalName || CONTROLLER.name}
          {CONTROLLER.regNumber && `, registration number ${CONTROLLER.regNumber}`}, {CONTROLLER.address}.
        </p>
        <p>
          For any question about your personal data, email us at{" "}
          <a href={`mailto:${CONTROLLER.email}`}>{CONTROLLER.email}</a>.
        </p>
      </>
    ),
  },
  {
    id: "yaki-dani",
    title: "What data we collect",
    body: (
      <>
        <p>We collect as little as possible, and only when you actively do something on the site:</p>
        <ul>
          <li>
            <strong>Browsing.</strong> Our hosting server automatically logs basic technical details of each request:
            IP address, browser type and time of visit. We don’t use advertising or analytics trackers, and we don’t
            set tracking cookies.
          </li>
          <li>
            <strong>Donations.</strong> Payments are made on Stripe’s secure checkout page. We receive your name, email,
            the amount and the date of your donation. Card details are handled by Stripe only — we never see or store them.
          </li>
          <li>
            <strong>Newsletter.</strong> If you subscribe, we keep your email address and the date you confirmed your consent.
          </li>
          <li>
            <strong>Correspondence.</strong> When you email or call us, we see your contact details and what you wrote to us about.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "navishcho",
    title: "Why we use it and on what legal basis",
    body: (
      <ul>
        <li>Running the website and keeping it secure — our legitimate interest (Art. 6(1)(f) GDPR).</li>
        <li>
          Accepting donations, sending receipts and keeping accounts — performing your request and meeting our legal
          obligations (Art. 6(1)(b) and 6(1)(c) GDPR).
        </li>
        <li>Sending the newsletter — your consent (Art. 6(1)(a) GDPR), which you can withdraw at any time.</li>
        <li>Replying to your messages — your request and our legitimate interest in helping you.</li>
      </ul>
    ),
  },
  {
    id: "komu",
    title: "Who we share data with",
    body: (
      <>
        <p>We never sell your data or share it for advertising. It is processed only by the services the site needs to work:</p>
        <ul>
          <li>
            <strong>Stripe</strong> — payments (donations).
          </li>
          <li>
            <strong>Website hosting</strong> — technical access logs.
          </li>
          <li>
            <strong>DatoCMS</strong> — our content management system; images on the site are loaded from its servers.
          </li>
          <li>
            <strong>Newsletter service</strong> — if you have subscribed.
          </li>
          <li>
            <strong>OpenStreetMap</strong> — maps on event pages are loaded from their servers.
          </li>
        </ul>
        <p>
          Some of these services may process data outside the EU. Where that happens, transfers rely on the European
          Commission’s Standard Contractual Clauses or an adequacy decision.
        </p>
      </>
    ),
  },
  {
    id: "skilky",
    title: "How long we keep it",
    body: (
      <ul>
        <li>Donation records — for as long as Greek accounting law requires.</li>
        <li>Newsletter email — until you unsubscribe.</li>
        <li>Correspondence — for as long as we need it to reply, and no longer than two years.</li>
        <li>Hosting logs — according to the provider’s settings, usually a few weeks.</li>
      </ul>
    ),
  },
  {
    id: "prava",
    title: "Your rights",
    body: (
      <>
        <p>Under the GDPR you can, at any time:</p>
        <ul>
          <li>find out what data we hold about you and get a copy of it;</li>
          <li>have inaccurate data corrected;</li>
          <li>ask us to delete your data;</li>
          <li>restrict or object to how we process it;</li>
          <li>withdraw your newsletter consent — via the “Unsubscribe” link in every email;</li>
          <li>receive your data in a portable format to pass on to another organisation.</li>
        </ul>
        <p>
          Write to <a href={`mailto:${CONTROLLER.email}`}>{CONTROLLER.email}</a> and we’ll reply within a month. If you
          believe your rights have been breached, you can lodge a complaint with the Hellenic Data Protection Authority
          (Αρχή Προστασίας Δεδομένων Προσωπικού Χαρακτήρα) —{" "}
          <a href="https://www.dpa.gr" target="_blank" rel="noopener noreferrer">
            www.dpa.gr
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "zminy",
    title: "Changes to this policy",
    body: (
      <p>
        If we change this policy, the new version will appear on this page with an updated date. We’ll let newsletter
        subscribers know about any significant changes.
      </p>
    ),
  },
];

const elSections = (CONTROLLER: Controller): Section[] => [
  {
    id: "khto-my",
    title: "Ποιος είναι υπεύθυνος για τα δεδομένα σας",
    body: (
      <>
        <p>
          Υπεύθυνος επεξεργασίας είναι η {CONTROLLER.legalName || CONTROLLER.name}
          {CONTROLLER.regNumber && `, αριθμός μητρώου ${CONTROLLER.regNumber}`}, διεύθυνση: {CONTROLLER.address}.
        </p>
        <p>
          Για οποιοδήποτε ερώτημα σχετικά με τα προσωπικά σας δεδομένα, γράψτε μας στο{" "}
          <a href={`mailto:${CONTROLLER.email}`}>{CONTROLLER.email}</a>.
        </p>
      </>
    ),
  },
  {
    id: "yaki-dani",
    title: "Ποια δεδομένα συλλέγουμε",
    body: (
      <>
        <p>Συλλέγουμε όσο το δυνατόν λιγότερα δεδομένα και μόνο όταν εσείς κάνετε κάτι στον ιστότοπο:</p>
        <ul>
          <li>
            <strong>Περιήγηση.</strong> Ο διακομιστής φιλοξενίας καταγράφει αυτόματα βασικά τεχνικά στοιχεία κάθε
            αιτήματος: διεύθυνση IP, τύπο προγράμματος περιήγησης, ώρα επίσκεψης. Δεν χρησιμοποιούμε διαφημιστικά ή
            αναλυτικά εργαλεία παρακολούθησης ούτε cookies παρακολούθησης.
          </li>
          <li>
            <strong>Δωρεές.</strong> Η πληρωμή γίνεται στην ασφαλή σελίδα της Stripe. Λαμβάνουμε το όνομά σας, το
            e-mail, το ποσό και την ημερομηνία της δωρεάς. Τα στοιχεία της κάρτας τα επεξεργάζεται μόνο η Stripe —
            εμείς δεν τα βλέπουμε ούτε τα αποθηκεύουμε.
          </li>
          <li>
            <strong>Newsletter.</strong> Αν εγγραφείτε, κρατάμε το e-mail σας και την ημερομηνία που επιβεβαιώσατε τη
            συγκατάθεσή σας.
          </li>
          <li>
            <strong>Επικοινωνία.</strong> Όταν μας στέλνετε e-mail ή μας τηλεφωνείτε, βλέπουμε τα στοιχεία επικοινωνίας
            σας και το περιεχόμενο του μηνύματος.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "navishcho",
    title: "Για ποιο σκοπό και με ποια νομική βάση",
    body: (
      <ul>
        <li>Η λειτουργία και η ασφάλεια του ιστότοπου — έννομο συμφέρον μας (άρθ. 6 παρ. 1 στ. στ΄ ΓΚΠΔ).</li>
        <li>
          Η αποδοχή δωρεών, η έκδοση αποδείξεων και η λογιστική παρακολούθηση — εκτέλεση του αιτήματός σας και νόμιμες
          υποχρεώσεις του φορέα (άρθ. 6 παρ. 1 στ. β΄ και γ΄ ΓΚΠΔ).
        </li>
        <li>Η αποστολή newsletter — η συγκατάθεσή σας (άρθ. 6 παρ. 1 στ. α΄ ΓΚΠΔ), την οποία μπορείτε να ανακαλέσετε οποτεδήποτε.</li>
        <li>Οι απαντήσεις στα μηνύματά σας — το αίτημά σας και το έννομο συμφέρον μας να σας βοηθήσουμε.</li>
      </ul>
    ),
  },
  {
    id: "komu",
    title: "Σε ποιους διαβιβάζουμε δεδομένα",
    body: (
      <>
        <p>
          Δεν πουλάμε δεδομένα και δεν τα διαθέτουμε για διαφήμιση. Τα επεξεργάζονται μόνο οι υπηρεσίες χωρίς τις
          οποίες ο ιστότοπος δεν λειτουργεί:
        </p>
        <ul>
          <li>
            <strong>Stripe</strong> — πληρωμές (δωρεές).
          </li>
          <li>
            <strong>Φιλοξενία ιστότοπου</strong> — τεχνικά αρχεία καταγραφής επισκέψεων.
          </li>
          <li>
            <strong>DatoCMS</strong> — σύστημα διαχείρισης περιεχομένου· οι εικόνες του ιστότοπου φορτώνονται από τους
            διακομιστές του.
          </li>
          <li>
            <strong>Υπηρεσία newsletter</strong> — εφόσον έχετε εγγραφεί.
          </li>
          <li>
            <strong>OpenStreetMap</strong> — ο χάρτης στις σελίδες εκδηλώσεων φορτώνεται από τους διακομιστές του.
          </li>
        </ul>
        <p>
          Ορισμένες από αυτές τις υπηρεσίες ενδέχεται να επεξεργάζονται δεδομένα εκτός ΕΕ. Σε αυτές τις περιπτώσεις η
          διαβίβαση βασίζεται στις τυποποιημένες συμβατικές ρήτρες της Ευρωπαϊκής Επιτροπής ή σε απόφαση επάρκειας.
        </p>
      </>
    ),
  },
  {
    id: "skilky",
    title: "Για πόσο καιρό τα κρατάμε",
    body: (
      <ul>
        <li>Στοιχεία δωρεών — για όσο διάστημα ορίζει η ελληνική νομοθεσία για τα λογιστικά βιβλία.</li>
        <li>E-mail για το newsletter — μέχρι να απεγγραφείτε.</li>
        <li>Αλληλογραφία — όσο χρειάζεται για να σας απαντήσουμε, και όχι περισσότερο από δύο χρόνια.</li>
        <li>Αρχεία καταγραφής φιλοξενίας — σύμφωνα με τις ρυθμίσεις του παρόχου, συνήθως λίγες εβδομάδες.</li>
      </ul>
    ),
  },
  {
    id: "prava",
    title: "Τα δικαιώματά σας",
    body: (
      <>
        <p>Σύμφωνα με τον ΓΚΠΔ μπορείτε ανά πάσα στιγμή:</p>
        <ul>
          <li>να μάθετε ποια δεδομένα σας διαθέτουμε και να λάβετε αντίγραφό τους·</li>
          <li>να ζητήσετε τη διόρθωση ανακριβών στοιχείων·</li>
          <li>να ζητήσετε τη διαγραφή τους·</li>
          <li>να περιορίσετε την επεξεργασία ή να αντιταχθείτε σε αυτήν·</li>
          <li>να ανακαλέσετε τη συγκατάθεσή σας για το newsletter — με τον σύνδεσμο «Απεγγραφή» σε κάθε μήνυμα·</li>
          <li>να λάβετε τα δεδομένα σας σε φορητή μορφή, ώστε να τα διαβιβάσετε σε άλλον φορέα.</li>
        </ul>
        <p>
          Γράψτε μας στο <a href={`mailto:${CONTROLLER.email}`}>{CONTROLLER.email}</a> — θα απαντήσουμε μέσα σε έναν
          μήνα. Αν θεωρείτε ότι παραβιάστηκαν τα δικαιώματά σας, μπορείτε να υποβάλετε καταγγελία στην Αρχή Προστασίας
          Δεδομένων Προσωπικού Χαρακτήρα —{" "}
          <a href="https://www.dpa.gr" target="_blank" rel="noopener noreferrer">
            www.dpa.gr
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "zminy",
    title: "Αλλαγές στην πολιτική",
    body: (
      <p>
        Αν αλλάξουμε αυτή την πολιτική, η νέα εκδοχή θα δημοσιευτεί σε αυτή τη σελίδα με ενημερωμένη ημερομηνία. Για
        σημαντικές αλλαγές θα ενημερώσουμε τους συνδρομητές του newsletter.
      </p>
    ),
  },
];

type Policy = {
  title: string;
  description: string;
  eyebrow: string;
  lead: string;
  updated: string;
  toc: string;
  footA: string;
  footLink: string;
  footB: string;
  sections: (c: Controller) => Section[];
};

export const policy: Record<Locale, Policy> = {
  uk: {
    title: "Політика конфіденційності",
    description: "Як Об’єднана українська діаспора в Греції обробляє персональні дані відвідувачів сайту.",
    eyebrow: "Документи",
    lead: "Коротко: ми збираємо мінімум даних, не стежимо за вами і не передаємо дані для реклами.",
    updated: "Редакція від 4 жовтня 2026",
    toc: "Зміст",
    footA: "Питання щодо даних — ",
    footLink: "контакти",
    footB: " або ",
    sections: ukSections,
  },
  en: {
    title: "Privacy policy",
    description: "How the United Ukrainian Diaspora in Greece handles the personal data of website visitors.",
    eyebrow: "Documents",
    lead: "In short: we collect as little data as possible, we don’t track you, and we never share your data for advertising.",
    updated: "Last updated: 4 October 2026",
    toc: "Contents",
    footA: "Questions about your data? See our ",
    footLink: "contacts",
    footB: " or write to ",
    sections: enSections,
  },
  el: {
    title: "Πολιτική απορρήτου",
    description: "Πώς η Ενωμένη Ουκρανική Διασπορά στην Ελλάδα επεξεργάζεται τα προσωπικά δεδομένα των επισκεπτών του ιστότοπου.",
    eyebrow: "Έγγραφα",
    lead: "Με λίγα λόγια: συλλέγουμε ελάχιστα δεδομένα, δεν σας παρακολουθούμε και δεν διαθέτουμε τα δεδομένα σας για διαφήμιση.",
    updated: "Τελευταία ενημέρωση: 4 Οκτωβρίου 2026",
    toc: "Περιεχόμενα",
    footA: "Ερωτήσεις για τα δεδομένα σας; Δείτε τα ",
    footLink: "στοιχεία επικοινωνίας",
    footB: " ή γράψτε μας στο ",
    sections: elSections,
  },
};
