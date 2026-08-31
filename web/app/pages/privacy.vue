<script setup lang="ts">
useHead({
  title: "Privacy Policy · Ikawe",
  meta: [
    {
      name: "description",
      content:
        "Privacy Policy for Ikawe, the local-first e-ink inspired reading app.",
    },
  ],
});
</script>

<template>
  <LegalDocument title="Privacy Policy" updated="August 31, 2026">
    <p>
      This Privacy Policy explains how Ikawe (“we,” “us,” or “our”) handles
      information when you use <a href="https://ikawe.ink">ikawe.ink</a> and
      related reader features (the “Service”).
    </p>

    <h2>1. Summary</h2>
    <p>
      Ikawe is designed to be local-first. Your uploaded books, covers, table of
      contents, paginated pages, and reading progress are stored in your browser
      (IndexedDB and local storage), not in a user account on our servers. We do
      not run advertising trackers on the Service, and we do not sell personal
      information.
    </p>

    <h2>2. Information stored on your device</h2>
    <p>
      When you use Ikawe, the following may be stored locally in your browser:
    </p>
    <ul>
      <li>Book text, metadata, covers, and table-of-contents data;</li>
      <li>Cached paginated pages for page-turn reading;</li>
      <li>Reading progress (scroll position, page index, percent complete);</li>
      <li>Reader settings such as theme, font, margins, and reading mode.</li>
    </ul>
    <p>
      This data stays on your device unless you clear site data, use a private
      browsing mode that discards it, or uninstall/reset your browser. We cannot
      recover your library if you delete local browser storage.
    </p>

    <h2>3. Information processed when you upload a file</h2>
    <p>
      When you upload a book, the file is sent to our server-side extraction API
      so we can return readable text and related reader data to your browser.
      That transmission is necessary to provide upload and extraction
      functionality. We process uploads to deliver the Service, not to create a
      permanent cloud library of your files.
    </p>
    <p>
      Do not upload sensitive personal information unless you accept that it
      will be transmitted for processing like any other uploaded file.
    </p>

    <h2>4. Server and hosting logs</h2>
    <p>
      Our web app and extraction API may automatically record standard technical
      information such as IP address, request time, user agent, error logs, and
      resource usage. We use this information to operate, secure, and
      troubleshoot the Service.
    </p>

    <h2>5. What we do not do</h2>
    <ul>
      <li>
        We do not require sign-up or maintain user profiles for Ikawe today;
      </li>
      <li>We do not serve third-party advertising on the Service;</li>
      <li>We do not sell your personal information.</li>
    </ul>

    <h2>6. Third-party services</h2>
    <p>
      The Service may rely on third parties for infrastructure and fonts,
      including:
    </p>
    <ul>
      <li>
        Hosting and API providers that process network requests needed to
        operate ikawe.ink and book extraction;
      </li>
      <li>
        Google Fonts, which may receive basic technical data when font files are
        loaded by your browser.
      </li>
    </ul>
    <p>
      Those providers process information according to their own policies and
      our agreements with them.
    </p>

    <h2>7. Cookies and similar technologies</h2>
    <p>
      Ikawe uses browser storage (such as local storage and IndexedDB) for app
      functionality rather than advertising cookies. Your browser may still
      store ordinary session or cache data while you use the site.
    </p>

    <h2>8. Children’s privacy</h2>
    <p>
      The Service is not directed to children under 13, and we do not knowingly
      collect personal information from children. If you believe a child has
      provided information through the Service, contact us and we will take
      appropriate steps.
    </p>

    <h2>9. Your choices</h2>
    <p>You can:</p>
    <ul>
      <li>Remove books from your library within the app;</li>
      <li>
        Clear Ikawe site data in your browser settings to delete local storage;
      </li>
      <li>Stop using the Service at any time.</li>
    </ul>

    <h2>10. International users</h2>
    <p>
      If you access the Service from outside the country where our
      infrastructure is located, your information may be processed in other
      jurisdictions with different data protection laws.
    </p>

    <h2>11. Changes to this policy</h2>
    <p>
      We may update this Privacy Policy from time to time. When we do, we will
      revise the “Last updated” date above. Material changes may also be
      reflected on the Service.
    </p>

    <h2>12. Contact</h2>
    <p>
      Privacy questions or requests may be sent to
      <a href="mailto:privacy@ikawe.ink">privacy@ikawe.ink</a>.
    </p>
  </LegalDocument>
</template>
