import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017/contentiq";

// Minimal model definitions for seeding (avoid importing full server modules)
const TemplateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, default: null },
  name: String,
  description: String,
  type: String,
  category: String,
  promptSchema: String,
  variables: [{ key: String, label: String, required: Boolean }],
  isPublic: { type: Boolean, default: true },
  isPro: { type: Boolean, default: false },
  usageCount: { type: Number, default: 0 },
}, { timestamps: true });

const Template = mongoose.model("Template", TemplateSchema);

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, default: "free" },
  emailVerified: { type: Boolean, default: true },
  credits: { remaining: Number, total: Number, resetDate: Date },
  subscription: { status: { type: String, default: "active" } },
  voicePreferences: { ttsVoice: String, speed: Number, autoTts: Boolean, language: String },
  refreshTokens: [String],
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

const SYSTEM_TEMPLATES = [
  {
    name: "Post LinkedIn Viral",
    description: "Structure éprouvée pour maximiser l'engagement LinkedIn",
    type: "linkedin",
    category: "social",
    promptSchema: "Génère un post LinkedIn viral sur {{sujet}} pour {{audience}}. Utilise un ton {{ton}} avec une accroche qui interpelle dès la première ligne, un développement en 3 points clés, et un CTA engageant.",
    variables: [
      { key: "sujet", label: "Sujet du post", required: true },
      { key: "audience", label: "Audience cible", required: false },
      { key: "ton", label: "Ton (professionnel, inspirant...)", required: false },
    ],
    isPublic: true,
    isPro: false,
  },
  {
    name: "Article Blog SEO",
    description: "Article de blog structuré H1/H2/H3 avec mots-clés",
    type: "blog",
    category: "marketing",
    promptSchema: "Rédige un article de blog SEO complet sur {{sujet}} ciblant le mot-clé principal {{motcle}}. Structure : titre H1 accrocheur + introduction avec le problème + 4 sections H2 avec sous-titres H3 + conclusion avec CTA. Longueur : 1000-1500 mots.",
    variables: [
      { key: "sujet", label: "Sujet de l'article", required: true },
      { key: "motcle", label: "Mot-clé SEO principal", required: false },
    ],
    isPublic: true,
    isPro: false,
  },
  {
    name: "Email de prospection B2B",
    description: "Email froid efficace pour décrocher des RDV",
    type: "email",
    category: "business",
    promptSchema: "Écris un email de prospection B2B pour proposer {{service}} à {{entreprise}}. Objet percutant + introduction personnalisée + identification du problème + solution + preuve sociale + CTA simple pour un appel de 15 min. Ton professionnel et direct, maximum 150 mots.",
    variables: [
      { key: "service", label: "Service ou produit proposé", required: true },
      { key: "entreprise", label: "Type d'entreprise cible", required: false },
    ],
    isPublic: true,
    isPro: false,
  },
  {
    name: "Description Produit E-commerce",
    description: "Fiche produit persuasive qui convertit",
    type: "product",
    category: "marketing",
    promptSchema: "Rédige une description produit persuasive pour {{produit}} vendu à {{prix}}. Bénéfices clés en bullet points + storytelling émotionnel + caractéristiques techniques + garanties + CTA. Optimisé pour la conversion.",
    variables: [
      { key: "produit", label: "Nom du produit", required: true },
      { key: "prix", label: "Prix", required: false },
    ],
    isPublic: true,
    isPro: false,
  },
  {
    name: "Script YouTube (5-10 min)",
    description: "Script vidéo engageant avec hook fort",
    type: "youtube",
    category: "social",
    promptSchema: "Écris un script YouTube de 5-10 minutes sur {{sujet}}. Structure : hook choc (0-30s) + teaser du contenu + introduction + 3 parties principales avec transitions + conclusion + CTA abonnement. Ton {{ton}}, adapté à {{audience}}.",
    variables: [
      { key: "sujet", label: "Sujet de la vidéo", required: true },
      { key: "audience", label: "Audience YouTube", required: false },
      { key: "ton", label: "Ton (éducatif, divertissant...)", required: false },
    ],
    isPublic: true,
    isPro: false,
  },
  {
    name: "Pitch Investisseur",
    description: "Pitch deck narratif pour convaincre des investisseurs",
    type: "pitch",
    category: "business",
    promptSchema: "Génère un pitch investisseur pour {{startup}} dans le secteur {{secteur}}. Structure : problème marché + solution innovante + taille de marché + modèle économique + traction actuelle + équipe + appel à financement de {{montant}}.",
    variables: [
      { key: "startup", label: "Nom de la startup", required: true },
      { key: "secteur", label: "Secteur d'activité", required: true },
      { key: "montant", label: "Montant de levée recherché", required: false },
    ],
    isPublic: true,
    isPro: true,
  },
  {
    name: "Thread Twitter Éducatif",
    description: "Thread de 10 tweets pour partager son expertise",
    type: "twitter",
    category: "social",
    promptSchema: "Crée un thread Twitter de 10 tweets éducatifs sur {{sujet}}. Tweet 1 : accroche avec promesse. Tweets 2-9 : une idée par tweet, format court et percutant. Tweet 10 : résumé + CTA follow. Utilise des chiffres et des analogies concrètes.",
    variables: [
      { key: "sujet", label: "Sujet du thread", required: true },
    ],
    isPublic: true,
    isPro: false,
  },
  {
    name: "Newsletter Hebdomadaire",
    description: "Newsletter engageante avec curation de contenu",
    type: "newsletter",
    category: "marketing",
    promptSchema: "Rédige une newsletter hebdomadaire sur {{theme}} pour {{audience}}. Structure : accroche personnelle + 3 ressources/actualités commentées + 1 tip actionnable + recommandation de la semaine + mot de fin chaleureux. Ton {{ton}}.",
    variables: [
      { key: "theme", label: "Thème de la newsletter", required: true },
      { key: "audience", label: "Lectorat", required: false },
      { key: "ton", label: "Ton éditorial", required: false },
    ],
    isPublic: true,
    isPro: true,
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connecté à MongoDB");

  // Seed templates système
  const existingCount = await Template.countDocuments({ isPublic: true, userId: null });
  if (existingCount === 0) {
    await Template.insertMany(SYSTEM_TEMPLATES.map((t) => ({ ...t, userId: null })));
    console.log(`✅ ${SYSTEM_TEMPLATES.length} templates système créés`);
  } else {
    console.log(`⚠️  Templates déjà présents (${existingCount} templates publics)`);
  }

  // Seed admin user
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@contentiq.app";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? "Admin1234!", 12);
    await User.create({
      name: "Admin CONTENT.IQ",
      email: adminEmail,
      passwordHash,
      role: "admin",
      emailVerified: true,
      credits: { remaining: 999999, total: 999999, resetDate: new Date("2099-12-31") },
      subscription: { status: "active" },
      voicePreferences: { ttsVoice: "native", speed: 1, autoTts: false, language: "fr-FR" },
      refreshTokens: [],
    });
    console.log(`✅ Admin créé : ${adminEmail}`);
  } else {
    console.log(`⚠️  Admin déjà existant : ${adminEmail}`);
  }

  await mongoose.disconnect();
  console.log("✅ Seed terminé");
}

seed().catch((err) => {
  console.error("❌ Erreur seed :", err);
  process.exit(1);
});
