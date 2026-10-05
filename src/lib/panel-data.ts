export type PanelRole = "ogrenci" | "danisman" | "veli";

export type WeeklyTask = {
  id: string;
  day: string;
  subject: string;
  title: string;
  duration: string;
  done: boolean;
};

export type TrialResult = {
  id: string;
  name: string;
  date: string;
  tyt: number;
  ayt: number;
  delta: string;
};

export type Meeting = {
  id: string;
  title: string;
  with: string;
  date: string;
  time: string;
  type: "online" | "check-in";
  status: "upcoming" | "done";
};

export type AdvisorStudent = {
  id: string;
  name: string;
  grade: string;
  program: "YKS" | "LGS";
  completion: number;
  lastNet: number;
  risk: "düşük" | "orta" | "yüksek";
  nextMeeting: string;
};

export const demoAccounts = {
  ogrenci: {
    email: "ogrenci@demo.com",
    password: "demo123",
    name: "Arda Yılmaz",
    grade: "12. Sınıf",
    program: "YKS Sayısal",
    coach: "Mert Yılmaz",
  },
  danisman: {
    email: "danisman@demo.com",
    password: "demo123",
    name: "Mert Yılmaz",
    title: "YKS Sayısal Mentörü",
    students: 12,
  },
  veli: {
    email: "veli@demo.com",
    password: "demo123",
    name: "Ayşe Yılmaz",
    child: "Arda Yılmaz",
  },
} as const;

export const studentTasks: WeeklyTask[] = [
  { id: "1", day: "Pzt", subject: "Matematik", title: "Türev problem seti (40 soru)", duration: "90 dk", done: true },
  { id: "2", day: "Pzt", subject: "Fizik", title: "Elektrik konusu tekrar", duration: "60 dk", done: true },
  { id: "3", day: "Sal", subject: "Kimya", title: "Organik tepkimeler", duration: "75 dk", done: false },
  { id: "4", day: "Sal", subject: "TYT Türkçe", title: "Paragraf seti 3", duration: "45 dk", done: false },
  { id: "5", day: "Çar", subject: "Matematik", title: "İntegral temel", duration: "90 dk", done: false },
  { id: "6", day: "Per", subject: "Biyoloji", title: "Sistemler özeti", duration: "60 dk", done: false },
  { id: "7", day: "Cum", subject: "Deneme", title: "TYT Genel Deneme #14", duration: "135 dk", done: false },
];

export const studentTrials: TrialResult[] = [
  { id: "t1", name: "TYT Genel #13", date: "28 Eyl", tyt: 92.5, ayt: 0, delta: "+4.25" },
  { id: "t2", name: "AYT Sayısal #8", date: "21 Eyl", tyt: 0, ayt: 48.75, delta: "+2.5" },
  { id: "t3", name: "TYT Genel #12", date: "14 Eyl", tyt: 88.25, ayt: 0, delta: "+1.75" },
  { id: "t4", name: "AYT Sayısal #7", date: "7 Eyl", tyt: 0, ayt: 46.25, delta: "-0.5" },
];

export const studentMeetings: Meeting[] = [
  {
    id: "m1",
    title: "Haftalık birebir seans",
    with: "Mert Yılmaz",
    date: "6 Eki",
    time: "19:00",
    type: "online",
    status: "upcoming",
  },
  {
    id: "m2",
    title: "Deneme analizi check-in",
    with: "Mert Yılmaz",
    date: "8 Eki",
    time: "21:00",
    type: "check-in",
    status: "upcoming",
  },
  {
    id: "m3",
    title: "Haftalık birebir seans",
    with: "Mert Yılmaz",
    date: "29 Eyl",
    time: "19:00",
    type: "online",
    status: "done",
  },
];

export const advisorStudents: AdvisorStudent[] = [
  {
    id: "s1",
    name: "Arda Yılmaz",
    grade: "12. Sınıf",
    program: "YKS",
    completion: 78,
    lastNet: 92.5,
    risk: "düşük",
    nextMeeting: "6 Eki 19:00",
  },
  {
    id: "s2",
    name: "Elif Kara",
    grade: "11. Sınıf",
    program: "YKS",
    completion: 54,
    lastNet: 71.0,
    risk: "orta",
    nextMeeting: "7 Eki 18:30",
  },
  {
    id: "s3",
    name: "Can Demir",
    grade: "Mezun",
    program: "YKS",
    completion: 41,
    lastNet: 63.25,
    risk: "yüksek",
    nextMeeting: "6 Eki 20:30",
  },
  {
    id: "s4",
    name: "Zeynep Aksoy",
    grade: "8. Sınıf",
    program: "LGS",
    completion: 86,
    lastNet: 445,
    risk: "düşük",
    nextMeeting: "8 Eki 17:00",
  },
  {
    id: "s5",
    name: "Emre Şahin",
    grade: "12. Sınıf",
    program: "YKS",
    completion: 62,
    lastNet: 84.5,
    risk: "orta",
    nextMeeting: "9 Eki 19:00",
  },
];

export const advisorAgenda = [
  { time: "18:30", student: "Elif Kara", type: "Birebir", note: "TYT Mat hız çalışması" },
  { time: "19:00", student: "Arda Yılmaz", type: "Birebir", note: "AYT Mat türev analizi" },
  { time: "20:30", student: "Can Demir", type: "Check-in", note: "Haftalık tamamlama uyarısı" },
];
