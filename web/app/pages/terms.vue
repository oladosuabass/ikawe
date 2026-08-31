<script setup lang="ts">
useHead({
  title: "Terms of Use · Ikawe",
  meta: [
    {
      name: "description",
      content:
        "Terms of Use for Ikawe, the e-ink inspired reading app at ikawe.ink.",
    },
  ],
});
</script>

<template>
  <LegalDocument title="Terms of Use" updated="August 31, 2026">
    <p>
      These Terms of Use (“Terms”) govern your access to and use of Ikawe at
      <a href="https://ikawe.ink">ikawe.ink</a> (the “Service”), including the
      web reader, library, and related features. By using the Service, you agree
      to these Terms.
    </p>

    <h2>1. The Service</h2>
    <p>
      Ikawe is a browser-based reading app that lets you upload book files,
      extract readable text where supported, and read them in an e-ink inspired
      interface. The Service is provided for personal, non-commercial use unless
      we agree otherwise in writing.
    </p>

    <h2>2. No account required</h2>
    <p>
      Ikawe does not require you to create an account. Your library, reading
      progress, and reader settings are stored locally in your browser unless
      you clear that data or we introduce optional cloud features in the future.
    </p>

    <h2>3. Your content and responsibilities</h2>
    <p>
      You are responsible for the files you upload and how you use the Service.
      You agree that you will not:
    </p>
    <ul>
      <li>Upload content you do not have the right to use or distribute;</li>
      <li>
        Use the Service to infringe copyright or other intellectual property
        rights;
      </li>
      <li>
        Upload malware, abusive material, or content that violates applicable
        law;
      </li>
      <li>
        Attempt to disrupt, reverse engineer, or overload the Service or its
        infrastructure.
      </li>
    </ul>
    <p>
      Ikawe is a reading tool. We do not monitor your library, and we do not
      grant you any rights to third-party works you upload.
    </p>

    <h2>4. File processing</h2>
    <p>
      When you upload a supported file, it may be sent to our extraction API for
      processing so text, images, covers, and table-of-contents data can be
      returned to your browser. Processing is performed to provide the Service,
      not to build a permanent hosted library of your files on our servers. See
      our
      <NuxtLink to="/privacy">Privacy Policy</NuxtLink> for more detail.
    </p>

    <h2>5. Availability and changes</h2>
    <p>
      We may modify, suspend, or discontinue any part of the Service at any
      time. Features, supported formats, and extraction quality may change
      without notice. Because your books are stored locally, clearing browser
      data or switching devices may remove access to your library unless you
      upload again.
    </p>

    <h2>6. Disclaimer</h2>
    <p>
      The Service is provided “as is” and “as available.” We do not warrant that
      extraction will be complete, accurate, or error-free for every file
      format, or that the Service will be uninterrupted or secure.
    </p>

    <h2>7. Limitation of liability</h2>
    <p>
      To the fullest extent permitted by law, Ikawe and its operators will not
      be liable for any indirect, incidental, special, consequential, or
      punitive damages, or for loss of data, profits, or goodwill, arising from
      your use of the Service.
    </p>

    <h2>8. Termination</h2>
    <p>
      You may stop using the Service at any time. We may restrict access if we
      reasonably believe you have violated these Terms or applicable law.
    </p>

    <h2>9. Changes to these Terms</h2>
    <p>
      We may update these Terms from time to time. The “Last updated” date at
      the top of this page will change when we do. Continued use of the Service
      after changes become effective constitutes acceptance of the revised
      Terms.
    </p>

    <h2>10. Contact</h2>
    <p>
      Questions about these Terms may be sent to
      <a href="mailto:legal@ikawe.ink">legal@ikawe.ink</a>.
    </p>
  </LegalDocument>
</template>
