// ─── AIRTABLE CONFIG ──────────────────────────────────────────────────────
// These values come from your .env file (see README)
const BASE_ID  = import.meta.env.VITE_AIRTABLE_BASE_ID;
const API_KEY  = import.meta.env.VITE_AIRTABLE_API_KEY;

const TABLES = {
  creative: "Creatives",
  business: "Businesses",
};

/**
 * Submit a form response to Airtable.
 * @param {object} data   - The form data object
 * @param {"creative"|"business"} type - Which form was submitted
 */
export async function submitToAirtable(data, type) {
  const table = TABLES[type];
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}`;

  // ── Map form fields → Airtable column names ──────────────────────────
  let fields = {};

  if (type === "creative") {
    fields = {
      "Full Name":         data.name || "",
      "Email":             data.email || "",
      "City":              data.city || "",
      "Age Range":         data.ageRange || "",
      "Profession":        data.profession === "Other" ? data.otherProfession : data.profession,
      "Specializations":   [
        ...data.specializations.filter(s => s !== "__other__"),
        ...(data.otherSpec ? [data.otherSpec] : []),
      ].join(", "),
      "Experience":        data.experience || "",
      "Portfolio":         data.portfolio || "",
      "Find Jobs Via":     data.findJobs.join(", "),
      "Job Search Struggle":    data.findStruggle || "",
      "Client Struggle":        data.clientStruggle || "",
      "Project Management":     data.projectManage.join(", "),
      "Would Use - Specialized Jobs": data.wouldUse.specialized || "",
      "Would Use - Booking":    data.wouldUse.booking || "",
      "Would Use - Payments":   data.wouldUse.payments || "",
      "Would Use - Comms":      data.wouldUse.communication || "",
      "Availability":           data.availability.join(", "),
      "Pay for Premium":        data.premium || "",
      "Phone":                  data.phone || "",
      "Submitted At":           new Date().toISOString(),
    };
  } else {
    fields = {
      "Business Name":     data.bizName || "",
      "Industry":          data.industry || "",
      "City":              data.city || "",
      "Team Size":         data.size || "",
      "Hire Frequency":    data.hireFreq || "",
      "Find Creatives Via":      data.findCreatives.join(", "),
      "Pain Points":             data.painPoints.join(", "),
      "Project Management":      data.projectManage.join(", "),
      "Would Use - Filter":      data.wouldUse.filter || "",
      "Would Use - Book":        data.wouldUse.book || "",
      "Would Use - Tasks":       data.wouldUse.tasks || "",
      "Would Use - Comms":       data.wouldUse.comms || "",
      "Would Use - No Commission": data.wouldUse.noComm || "",
      "Sub - Verified Creatives": data.subWould.verified || "",
      "Sub - Hiring System":     data.subWould.system || "",
      "Sub - PM Tools":          data.subWould.pm || "",
      "Monthly Budget":          data.budget || "",
      "Must-Have Feature":       data.mustHave || "",
      "Contact Email":           data.contactEmail || "",
      "Submitted At":            new Date().toISOString(),
    };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error("Airtable error:", err);
    throw new Error(err?.error?.message || "Airtable submission failed");
  }

  return await res.json();
}
