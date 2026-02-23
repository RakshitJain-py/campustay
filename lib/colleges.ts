/**
 * Delhi/NCR colleges — used for navbar search (case-insensitive contains match only).
 */

export const DELHI_NCR_COLLEGES: string[] = [
  "AIIMS Delhi",
  "Amity University Noida",
  "Ashoka University",
  "Bharati Vidyapeeth",
  "Delhi Technological University",
  "DTU",
  "Gargi College",
  "Hansraj College",
  "IIT Delhi",
  "IIIT Delhi",
  "IIM Delhi",
  "IP University",
  "GGSIPU",
  "Jamia Millia Islamia",
  "Jamia Hamdard",
  "Jesus and Mary College",
  "Lady Shri Ram College",
  "Miranda House",
  "NSUT",
  "Netaji Subhas University of Technology",
  "NIIT University",
  "NIFT Delhi",
  "NIT Delhi",
  "Ramjas College",
  "Shri Ram College of Commerce",
  "SRCC",
  "St. Stephen's College",
  "University of Delhi",
  "DU",
  "VIT Vellore NCR",
  "Amity Noida",
  "Bennett University",
  "Galgotias University",
  "Greater Noida",
  "Shiv Nadar University",
  "Manipal University Jaipur",
  "BITS Pilani",
  "Jamia",
  "Delhi University",
  "Noida",
  "Gurugram",
  "Ghaziabad",
  "Faridabad",
];

export function searchColleges(query: string): string[] {
  if (!query || typeof query !== "string") return [];
  const list = DELHI_NCR_COLLEGES ?? [];
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return list.filter((name) => name.toLowerCase().includes(q));
}
