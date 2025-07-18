import React from 'react';

const TermsAndConditions = () => {
  const websiteName = "[Your Website Name]"; // IMPORTANT: Replace with your actual website name
  const companyName = "[Your Company Name/Legal Entity]"; // IMPORTANT: Replace with your legal entity
  const privacyPolicyLink = "[Link to your Privacy Policy]"; // IMPORTANT: Replace with your Privacy Policy URL
  const googleTermsLink = "https://policies.google.com/terms"; // Google Terms of Service
  const googlePrivacyLink = "https://policies.google.com/privacy"; // Google Privacy Policy
  const githubTermsLink = "https://docs.github.com/en/site-policy/github-terms/github-terms-of-service"; // GitHub Terms of Service
  const githubPrivacyLink = "https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement"; // GitHub Privacy Statement
  const supportEmail = "[Your Support Email Address]"; // IMPORTANT: Replace with your support email
  const contactUsLink = "[Link to your Contact Us page]"; // IMPORTANT: Replace with your Contact Us page URL
  const jurisdiction = "[Your Jurisdiction/Country, e.g., India]"; // IMPORTANT: Replace with your legal jurisdiction

  return (
    <div style={{
      fontFamily: "'Segoe UI', sans-serif",
      color: '#333',
      lineHeight: '1.6',
      maxWidth: '900px',
      margin: '40px auto',
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
    }}>
      <h1 style={{
        color: '#2c3e50',
        textAlign: 'center',
        marginBottom: '30px',
        fontSize: '2.5em'
      }}>Terms and Conditions</h1>

      <div style={{
        backgroundColor: '#e6f7ff',
        padding: '25px',
        borderRadius: '10px',
        border: '1px solid #91d5ff',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h3 style={{
          color: '#096dd9',
          fontFamily: "'Segoe UI', sans-serif",
          margin: '0 0 10px 0',
          fontSize: '1.5em'
        }}>Your Agreement to Our Terms</h3>
        <p style={{
          color: '#336699',
          fontFamily: "'Segoe UI', sans-serif",
          lineHeight: '1.7',
          fontSize: '1.1em'
        }}>
          Welcome to **{websiteName}**! By accessing or using our website and services, you signify that you have read, understood, and agree to be bound by these **Terms and Conditions** ("Terms"). If you do not agree with any part of these Terms, you must not use our website or services. We reserve the right to update and change these Terms at any time without notice. Your continued use of the service after any such changes constitutes your acceptance of the new Terms.
        </p>
      </div>

      <hr style={{ borderTop: '1px solid #eee', margin: '30px 0' }} />

      <h2 style={{ color: '#2980b9', marginBottom: '15px' }}>1. Introduction and Acceptance</h2>
      <p>
        These Terms and Conditions govern your access to and use of **{websiteName}** (the "Website") and all associated services, features, content, and applications (collectively, the "Services") provided by **{companyName}** ("we," "us," or "our").
      </p>
      <p>
        By registering an account, logging in, or simply using any part of our Services, you acknowledge that you have read, understood, and agree to comply with and be bound by these Terms, along with our <a href={privacyPolicyLink} style={{ color: '#1890ff', textDecoration: 'none' }}>Privacy Policy</a>. These Terms constitute a legally binding agreement between you and **{companyName}**.
      </p>

      <h2 style={{ color: '#2980b9', marginBottom: '15px' }}>2. Eligibility and Account Registration</h2>
      <p>
        You must be at least **13** years old to use our Services. By using our Services, you represent and warrant that you meet this age requirement.
      </p>
      <p>
        When you register an account with **{websiteName}**, you agree to:
      </p>
      <ul>
        <li>Provide accurate, current, and complete information as prompted by the registration forms.</li>
        <li>Maintain the security and confidentiality of your password and account credentials.</li>
        <li>Maintain and promptly update the registration data, and any other information you provide to us, to keep it accurate, current, and complete.</li>
        <li>Be solely responsible for all activity that occurs under your account.</li>
      </ul>

      <h2 style={{ color: '#2980b9', marginBottom: '15px' }}>3. Service Offerings and Login Methods</h2>
      <p>
        We offer a range of services designed to **enhance your resume, prepare for interviews, and optimize your job search**. The scope of Services available to you may vary based on your login method:
      </p>
      <ul>
        <li>
          <strong>Normal Account (Email/Password):</strong> Provides access to basic features including **our core resume editor, limited document storage, and access to community forums.**
        </li>
        <li>
          <strong>Google Login:</strong> In addition to basic features, logging in via Google allows for **seamless document import from Google Drive and enhanced profile management linked to your Google account.** By using Google login, you also agree to be bound by the <a href={googleTermsLink} target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff', textDecoration: 'none' }}>Google Terms of Service</a> and <a href={googlePrivacyLink} target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff', textDecoration: 'none' }}>Google Privacy Policy</a>. Your use of our services in conjunction with Google's services is subject to Google's policies, including those governing data access and security.
        </li>
        <li>
          <strong>GitHub Login:</strong> Logging in via GitHub provides similar basic features and enables **code portfolio integration, collaborative project features, and access to developer-focused tools.** By using GitHub login, you agree to be bound by the <a href={githubTermsLink} target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff', textDecoration: 'none' }}>GitHub Terms of Service</a> and <a href={githubPrivacyLink} target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff', textDecoration: 'none' }}>GitHub Privacy Statement</a>. Your interactions through GitHub are governed by GitHub's policies.
        </li>
      </ul>
      <p>
        <strong>Storage Space:</strong> We provide **up to 100MB of free storage space** for your documents and related content. This storage is subject to our fair usage policy and may be reviewed or adjusted based on your subscription level. Any additional storage requirements may be subject to additional charges.
      </p>

      <h2 style={{ color: '#2980b9', marginBottom: '15px' }}>4. Cloud Services and Data Handling</h2>
      <p>
        Our Services rely on robust cloud infrastructure provided by leading cloud service providers (e.g., AWS, Google Cloud, Azure). While we strive for maximum uptime and data security, you acknowledge that:
      </p>
      <ul>
        <li>
          <strong>Data Residency:</strong> Your data may be stored and processed in data centers located in various regions globally.
        </li>
        <li>
          <strong>Data Security:</strong> We implement industry-standard security measures to protect your data, but no system is entirely foolproof. You are responsible for maintaining the confidentiality of your account credentials.
        </li>
        <li>
          <strong>Compliance:</strong> We endeavor to comply with applicable data protection regulations (e.g., GDPR, CCPA) concerning your data stored in our cloud infrastructure. For more details, please refer to our <a href={privacyPolicyLink} style={{ color: '#1890ff', textDecoration: 'none' }}>Privacy Policy</a>.
        </li>
        <li>
          <strong>Service Availability:</strong> While we aim for high availability, cloud service disruptions are beyond our direct control. We are not liable for any loss or damage arising from such disruptions.
        </li>
      </ul>

      <h2 style={{ color: '#2980b9', marginBottom: '15px' }}>5. Acceptable Use and Prohibited Conduct</h2>
      <p>
        You agree to use the Services only for lawful purposes and in a manner that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the Services. Prohibited conduct includes, but is not limited to:
      </p>
      <ul>
        <li>Uploading or transmitting any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically, or otherwise objectionable.</li>
        <li>Engaging in any activity that could disable, overburden, damage, or impair the proper working of the Website.</li>
        <li>Attempting to gain unauthorized access to any parts of the Website, other accounts, computer systems, or networks connected to the Website.</li>
        <li>Using the Services to transmit spam, junk mail, chain letters, or unsolicited mass distribution of email.</li>
        <li>Impersonating any person or entity or falsely stating or otherwise misrepresenting your affiliation with a person or entity.</li>
        <li>Violating any applicable local, state, national, or international law or regulation.</li>
        <li>**Uploading or manipulating content within our editor, especially PDF files, that contains abusive, harmful, illegal, or unwanted material. This includes, but is not limited to, malware, viruses, hate speech, explicit content, or content infringing on intellectual property rights.**</li>
      </ul>
      <p style={{
        backgroundColor: '#ffe0b2',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #ffcc80',
        color: '#e65100'
      }}>
        **Abuse Warning:** We reserve the right to investigate and take appropriate legal action against anyone who, in our sole discretion, violates this provision. This may include, without limitation, immediate **suspension or termination of your account**, removal of the offending content from the Service, and reporting to relevant authorities.
      </p>

      <h2 style={{ color: '#2980b9', marginBottom: '15px' }}>6. ATS Resume Check Policy</h2>
      <p>
        Our ATS (Applicant Tracking System) Resume Check service helps you optimize your resume. Please note the following specific terms for this service:
      </p>
      <ul>
        <li>
          <strong>Rate Limit (Free Tier):</strong> For our free users, you are limited to **one (1) ATS resume check per resume file within a two (2) hour period**. This limit resets two hours after your last submission of the same file.
        </li>
        <li>
          <strong>Fair Usage:</strong> This policy is in place to ensure fair usage of our computational resources and to prevent abuse.
        </li>
        <li>
          <strong>Additional Checks (Pay-As-You-Go):</strong> If you require more frequent or a higher volume of ATS checks beyond the free tier limit, please contact us at **{supportEmail}**. We offer flexible "pay-as-you-go" options tailored to your needs. Our team will provide details on pricing and how to proceed.
        </li>
        <li>
          <strong>Accuracy:</strong> While our ATS check is designed to provide valuable insights, it is an AI-driven tool. We do not guarantee job placement or absolute accuracy of results. It should be used as a supplementary tool in your job search.
        </li>
      </ul>

      <h2 style={{ color: '#2980b9', marginBottom: '15px' }}>7. Intellectual Property</h2>
      <p>
        All content, features, and functionality on the Website, including text, graphics, logos, icons, images, audio clips, digital downloads, data compilations, and software, are the exclusive property of **{companyName}** or its content suppliers and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
      </p>
      <p>
        You may not modify, copy, distribute, transmit, display, perform, reproduce, publish, license, create derivative works from, transfer, or sell any information, software, products, or services obtained from the Services without our prior written consent.
      </p>

      <h2 style={{ color: '#2980b9', marginBottom: '15px' }}>8. Termination</h2>
      <p>
        We may terminate or suspend your account and bar access to the Services immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
      </p>
      <p>
        If you wish to terminate your account, you may simply discontinue using the Services or contact us at **{supportEmail}** for account deletion.
      </p>
      <p>
        All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
      </p>

      <h2 style={{ color: '#2980b9', marginBottom: '15px' }}>9. Disclaimer of Warranties</h2>
      <p>
        The Services are provided on an "AS IS" and "AS AVAILABLE" basis. We make no representations or warranties of any kind, express or implied, as to the operation of their Services or the information, content, materials, or products included on the Services. You expressly agree that your use of the Services is at your sole risk.
      </p>
      <p>
        To the full extent permissible by applicable law, we disclaim all warranties, express or implied, including, but not limited to, implied warranties of merchantability and fitness for a particular purpose. We do not warrant that the Services, its servers, or e-mail sent from us are free of viruses or other harmful components.
      </p>

      <h2 style={{ color: '#2980b9', marginBottom: '15px' }}>10. Limitation of Liability</h2>
      <p>
        In no event shall **{companyName}**, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Services; (ii) any conduct or content of any third party on the Services; (iii) any content obtained from the Services; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence), or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.
      </p>

      <h2 style={{ color: '#2980b9', marginBottom: '15px' }}>11. Governing Law</h2>
      <p>
        These Terms shall be governed and construed in accordance with the laws of **{jurisdiction}**, without regard to its conflict of law provisions.
      </p>
      <p>
        Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
      </p>

      <h2 style={{ color: '#2980b9', marginBottom: '15px' }}>12. Changes to Terms and Conditions</h2>
      <p>
        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least **30 days'** notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
      </p>
      <p>
        By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.
      </p>

      <h2 style={{ color: '#2980b9', marginBottom: '15px' }}>13. Contact Us</h2>
      <p>
        If you have any questions about these Terms, please contact us:
      </p>
      <ul>
        <li>By email: **{supportEmail}**</li>
        <li>By visiting this page on our website: <a href={contactUsLink} style={{ color: '#1890ff', textDecoration: 'none' }}>**{contactUsLink}**</a></li>
      </ul>

      <div style={{
        backgroundColor: '#d9f7be',
        padding: '25px',
        borderRadius: '10px',
        border: '1px solid #b7eb8f',
        marginTop: '40px',
        textAlign: 'center'
      }}>
        <p style={{
          color: '#389e0d',
          fontFamily: "'Segoe UI', sans-serif",
          fontSize: '1.2em',
          fontWeight: 'bold',
          margin: 0
        }}>
          By proceeding to sign up or use our Services, you confirm that you have read, understood, and agreed to these Terms and Conditions.
        </p>
      </div>
    </div>
  );
};

export default TermsAndConditions;