/**
 * Contenu des pages légales (FR/EN). ⚠️ Texte standard de départ — à FAIRE
 * VALIDER PAR UN JURISTE avant mise en production réelle. Structuré en sections
 * pour un rendu simple et un bon balisage sémantique (SEO/accessibilité).
 */

export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalDoc {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

type Lang = "fr" | "en";

const EDITOR = "CODEXA Solutions";
const CONTACT = "wariss.osseni.wo@gmail.com";

export const PRIVACY: Record<Lang, LegalDoc> = {
  fr: {
    title: "Politique de confidentialité",
    updated: "Dernière mise à jour : juin 2026",
    intro: `La présente politique décrit comment CONTENT.IQ, édité par ${EDITOR}, collecte et traite vos données personnelles.`,
    sections: [
      {
        heading: "1. Données collectées",
        body: [
          "Données de compte : nom, adresse email, mot de passe (haché), et le cas échéant identifiant Google lors d'une connexion OAuth.",
          "Données d'usage : contenus générés, historique, crédits consommés, journaux techniques (adresse IP, horodatage) à des fins de sécurité et de débogage.",
        ],
      },
      {
        heading: "2. Finalités du traitement",
        body: [
          "Fournir le service (génération, historique, export, facturation).",
          "Assurer la sécurité, prévenir la fraude et améliorer le produit.",
        ],
      },
      {
        heading: "3. Sous-traitants et partage",
        body: [
          "Des prestataires techniques traitent certaines données pour notre compte : Anthropic (génération IA), Stripe (paiement), hébergeurs et services email. Vos contenus ne sont pas vendus à des tiers.",
        ],
      },
      {
        heading: "4. Conservation",
        body: [
          "Les journaux techniques sont conservés 90 jours. Les données de compte sont conservées tant que le compte est actif.",
        ],
      },
      {
        heading: "5. Vos droits (RGPD)",
        body: [
          "Vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données.",
          `Pour exercer ces droits : ${CONTACT}.`,
        ],
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    updated: "Last updated: June 2026",
    intro: `This policy explains how CONTENT.IQ, operated by ${EDITOR}, collects and processes your personal data.`,
    sections: [
      {
        heading: "1. Data we collect",
        body: [
          "Account data: name, email address, password (hashed), and a Google identifier when signing in via OAuth.",
          "Usage data: generated content, history, credits consumed, technical logs (IP address, timestamps) for security and debugging.",
        ],
      },
      {
        heading: "2. Purposes",
        body: [
          "Provide the service (generation, history, export, billing).",
          "Ensure security, prevent fraud and improve the product.",
        ],
      },
      {
        heading: "3. Processors and sharing",
        body: [
          "Technical providers process some data on our behalf: Anthropic (AI generation), Stripe (payments), hosting and email services. Your content is not sold to third parties.",
        ],
      },
      {
        heading: "4. Retention",
        body: [
          "Technical logs are kept for 90 days. Account data is kept while the account is active.",
        ],
      },
      {
        heading: "5. Your rights (GDPR)",
        body: [
          "You have the right to access, rectify, erase and port your data.",
          `To exercise these rights: ${CONTACT}.`,
        ],
      },
    ],
  },
};

export const TERMS: Record<Lang, LegalDoc> = {
  fr: {
    title: "Conditions d'utilisation",
    updated: "Dernière mise à jour : juin 2026",
    intro: `En utilisant CONTENT.IQ, édité par ${EDITOR}, vous acceptez les présentes conditions d'utilisation.`,
    sections: [
      {
        heading: "1. Service",
        body: [
          "CONTENT.IQ fournit des outils de génération de contenu assistée par IA. Le service est fourni « en l'état », sans garantie d'exactitude des contenus générés.",
        ],
      },
      {
        heading: "2. Compte et crédits",
        body: [
          "Vous êtes responsable de la confidentialité de vos identifiants. Les crédits sont consommés à chaque génération selon le volume de tokens.",
        ],
      },
      {
        heading: "3. Usage acceptable",
        body: [
          "Vous vous engagez à ne pas utiliser le service pour produire des contenus illégaux, diffamatoires ou portant atteinte aux droits de tiers.",
        ],
      },
      {
        heading: "4. Propriété des contenus",
        body: [
          "Vous conservez la propriété des contenus que vous générez, dans le respect des conditions des fournisseurs de modèles IA sous-jacents.",
        ],
      },
      {
        heading: "5. Résiliation",
        body: [
          "Nous pouvons suspendre un compte en cas de violation des présentes conditions.",
          `Contact : ${CONTACT}.`,
        ],
      },
    ],
  },
  en: {
    title: "Terms of Service",
    updated: "Last updated: June 2026",
    intro: `By using CONTENT.IQ, operated by ${EDITOR}, you agree to these terms of service.`,
    sections: [
      {
        heading: "1. Service",
        body: [
          'CONTENT.IQ provides AI-assisted content generation tools. The service is provided "as is", without warranty as to the accuracy of generated content.',
        ],
      },
      {
        heading: "2. Account and credits",
        body: [
          "You are responsible for keeping your credentials confidential. Credits are consumed on each generation based on token volume.",
        ],
      },
      {
        heading: "3. Acceptable use",
        body: [
          "You agree not to use the service to produce illegal, defamatory content or content infringing third-party rights.",
        ],
      },
      {
        heading: "4. Content ownership",
        body: [
          "You retain ownership of the content you generate, subject to the terms of the underlying AI model providers.",
        ],
      },
      {
        heading: "5. Termination",
        body: [
          "We may suspend an account in case of violation of these terms.",
          `Contact: ${CONTACT}.`,
        ],
      },
    ],
  },
};
