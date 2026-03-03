// backend/src/routes/providers.js
// Handles full provider profile creation + retrieval including PDF/image file storage
const express = require('express');
const router  = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma  = new PrismaClient();
const multer  = require('multer');

// ── multer: keep files in memory so we can convert to base64 ──────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 100 * 1024 * 1024 }, // 100 MB
});

// ── Helper: Buffer → base64 data-URL ─────────────────────────────────────────
function toDataUrl(buffer, mimetype) {
  if (!buffer) return null;
  return `data:${mimetype};base64,${buffer.toString('base64')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/providers  — create / upsert full provider profile after registration
//
//  The frontend sends a multipart/form-data request with:
//    • providerData  — JSON string containing all text fields
//    • certFile_0, certFile_1 … — uploaded certificate/qualification files
//    • clearanceFile_0 … — uploaded police clearance files
//
//  Falls back to plain JSON body if Content-Type is application/json
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', upload.any(), async (req, res) => {
  try {
    // 1. Parse the JSON blob
    let d = {};
    if (req.body.providerData) {
      try { d = JSON.parse(req.body.providerData); }
      catch { return res.status(400).json({ message: 'Invalid providerData JSON' }); }
    } else {
      d = req.body;
    }

    const {
      userId,
      fullName,
      accountType,
      bio,
      experience,
      languages          = [],
      primaryCategory,
      secondaryCategories = [],
      serviceTitle,
      serviceDesc,
      subjects,
      ageGroups          = [],
      deliveryMode,
      city,
      province,
      serviceAreaType,
      radius,
      pricingModel,
      startingPrice,
      availabilityDays   = [],
      availabilityNotes,
      phone,
      whatsapp,
      inquiryEmail,
      website,
      facebook,
      instagram,
      linkedin,
      tiktok,
      twitter,
      youtube,           // stored to website field as fallback if no website
      degrees,
      certifications,
      certTextEntry,
      memberships,
      clearanceText,
      clearance,
      listingPlan        = 'free',
      profilePhoto,      // base64 string (already converted on the frontend via FileReader)
    } = d;

    if (!userId)   return res.status(400).json({ message: 'userId is required' });
    if (!fullName) return res.status(400).json({ message: 'fullName is required' });

    // 2. Extract uploaded files from multer
    const files = req.files || [];

    // Cert files: fieldnames certFile_0, certFile_1 …
    const certBufs = files.filter(f => f.fieldname.startsWith('certFile_'));
    // Clearance files
    const clearBufs = files.filter(f => f.fieldname.startsWith('clearanceFile_'));

    // We store the first of each (schema has a single slot per type)
    const primaryCert  = certBufs[0]  || null;
    const primaryClear = clearBufs[0] || null;

    const certFileData      = primaryCert  ? toDataUrl(primaryCert.buffer,  primaryCert.mimetype)  : null;
    const clearanceFileData = primaryClear ? toDataUrl(primaryClear.buffer, primaryClear.mimetype) : null;

    // 3. Resolve effective certifications text (either from field or text entry)
    const effectiveCerts = certifications || certTextEntry || null;

    // 4. Coerce arrays — frontend may send stringified JSON for some fields
    const toArr = (val) => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') {
        try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; }
        catch { return val ? [val] : []; }
      }
      return [];
    };

    const profileData = {
      fullName,
      accountType:          accountType         || 'Individual Provider',
      bio:                  bio                 || null,
      experience:           experience != null  ? parseInt(experience) : null,
      languages:            toArr(languages),
      primaryCategory:      primaryCategory     || null,
      secondaryCategories:  toArr(secondaryCategories),
      serviceTitle:         serviceTitle        || null,
      serviceDesc:          serviceDesc         || null,
      subjects:             subjects            || null,
      ageGroups:            toArr(ageGroups),
      deliveryMode:         deliveryMode        || null,
      city:                 city                || null,
      province:             province            || null,
      serviceAreaType:      serviceAreaType     || 'national',
      radius:               radius != null      ? parseInt(radius) : null,
      pricingModel:         pricingModel        || null,
      startingPrice:        startingPrice       || null,
      availabilityDays:     toArr(availabilityDays),
      availabilityNotes:    availabilityNotes   || null,
      phone:                phone               || null,
      whatsapp:             whatsapp            || null,
      inquiryEmail:         inquiryEmail        || null,
      website:              website             || youtube || null,
      facebook:             facebook            || null,
      instagram:            instagram           || null,
      linkedin:             linkedin            || null,
      tiktok:               tiktok              || null,
      twitter:              twitter             || null,
      degrees:              degrees             || null,
      certifications:       effectiveCerts,
      memberships:          memberships         || null,
      clearance:            clearanceText || clearance || null,
      listingPlan,
      status:               'PENDING',
      publicDisplay:        false,
      // Files — only set if we have actual data
      ...(profilePhoto       && { profilePhoto }),
      ...(certFileData       && { certFile: certFileData, certFileName: primaryCert.originalname, certFileType: primaryCert.mimetype }),
      ...(clearanceFileData  && { clearanceFile: clearanceFileData, clearanceFileName: primaryClear.originalname, clearanceFileType: primaryClear.mimetype }),
    };

    // 5. Upsert — create if first time, update if re-submitting
    const profile = await prisma.providerProfile.upsert({
      where:  { userId },
      create: { userId, ...profileData },
      update: profileData,
    });

    return res.status(201).json({
      message:   'Provider profile saved successfully',
      profileId: profile.id,
      userId:    profile.userId,
    });

  } catch (error) {
    console.error('POST /api/providers error:', error);
    return res.status(500).json({ message: 'Server error saving provider profile', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/providers  — list all (admin use)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const providers = await prisma.providerProfile.findMany({
      include: {
        user: { select: { email: true, name: true, role: true, createdAt: true, lastLogin: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(providers);
  } catch (error) {
    console.error('GET /api/providers error:', error);
    return res.status(500).json({ message: 'Server error fetching providers' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/providers/:userId  — single profile (client dashboard)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:userId', async (req, res) => {
  try {
    const profile = await prisma.providerProfile.findUnique({
      where:   { userId: req.params.userId },
      include: {
        user:    { select: { email: true, name: true, role: true, createdAt: true, lastLogin: true } },
        reviews: true,
      },
    });
    if (!profile) return res.status(404).json({ message: 'Provider profile not found' });
    return res.json(profile);
  } catch (error) {
    console.error('GET /api/providers/:userId error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  PATCH /api/providers/:userId  — update profile (client dashboard save)
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:userId', upload.any(), async (req, res) => {
  try {
    let updates = {};
    if (req.body.providerData) {
      try { updates = JSON.parse(req.body.providerData); }
      catch { updates = req.body; }
    } else {
      updates = req.body;
    }

    const files        = req.files || [];
    const newCert      = files.find(f => f.fieldname.startsWith('certFile_'));
    const newClearance = files.find(f => f.fieldname.startsWith('clearanceFile_'));

    // Build safe update object (only known schema fields)
    const ALLOWED = new Set([
      'fullName','accountType','bio','experience','languages','primaryCategory',
      'secondaryCategories','serviceTitle','serviceDesc','subjects','ageGroups',
      'deliveryMode','city','province','serviceAreaType','radius','pricingModel',
      'startingPrice','availabilityDays','availabilityNotes','phone','whatsapp',
      'inquiryEmail','website','facebook','instagram','linkedin','tiktok','twitter',
      'degrees','certifications','memberships','clearance','listingPlan','status',
      'publicDisplay','profilePhoto','certFile','certFileName','certFileType',
      'clearanceFile','clearanceFileName','clearanceFileType',
    ]);

    const data = {};
    Object.entries(updates).forEach(([k, v]) => { if (ALLOWED.has(k)) data[k] = v; });

    if (data.experience) data.experience = parseInt(data.experience);
    if (data.radius)     data.radius     = parseInt(data.radius);

    if (newCert) {
      data.certFile     = toDataUrl(newCert.buffer, newCert.mimetype);
      data.certFileName = newCert.originalname;
      data.certFileType = newCert.mimetype;
    }
    if (newClearance) {
      data.clearanceFile     = toDataUrl(newClearance.buffer, newClearance.mimetype);
      data.clearanceFileName = newClearance.originalname;
      data.clearanceFileType = newClearance.mimetype;
    }

    const profile = await prisma.providerProfile.update({
      where: { userId: req.params.userId },
      data,
    });
    return res.json({ message: 'Profile updated', profile });
  } catch (error) {
    console.error('PATCH /api/providers/:userId error:', error);
    return res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  PATCH /api/providers/:userId/status  — admin approve / reject
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:userId/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status))
      return res.status(400).json({ message: 'Invalid status value' });

    const profile = await prisma.providerProfile.update({
      where: { userId: req.params.userId },
      data:  { status, publicDisplay: status === 'APPROVED' },
    });
    return res.json({ message: `Provider ${status.toLowerCase()}`, profile });
  } catch (error) {
    console.error('PATCH /api/providers/:userId/status error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;