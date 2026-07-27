import { Users, Mail } from "lucide-react";

export const metadata = {
  title: "Our Team | EPMOC",
  description: "Meet the EPMOC team.",
};

const STATIC_TEAM = [
  {
    id: 1,
    name: "Chirag Jain",
    designation: "president",
    department: "Volunteering",
    email: "23218@iiitu.ac.in",
  },
  {
    id: 2,
    name: "Tarsem Singh",
    designation: "Head",
    department: "Technical",
    email: "23145@iiitu.ac.in",
  },
  {
    id: 3,
    name: "Ganika Sharma",
    designation: "member",
    department: "PR",
    email: "25108@iiitu.ac.in",
  },
  {
    id: 4,
    name: "Ujjal Sharma",
    designation: "member",
    department: "Coverage",
    email: "24112@iiitu.ac.in",
  }
];

export default function TeamPage() {
  const leadership = STATIC_TEAM.filter(m => m.designation === "president");
  const heads = STATIC_TEAM.filter(m => m.designation === "Head");
  const members = STATIC_TEAM.filter(m => m.designation === "member");

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="container-section py-16 space-y-16">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Our Team
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            The passionate students powering our club across different departments.
          </p>
        </div>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Leadership</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {leadership.map((m) => (
              <MemberCard key={m.id} member={m} featured />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Department Heads</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {heads.map((m) => (
              <MemberCard key={m.id} member={m} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Members</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {members.map((m) => (
              <MemberCard key={m.id} member={m} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function MemberCard({ member, featured = false }: { member: any; featured?: boolean }) {
  return (
    <div className={`card p-6 flex flex-col items-center text-center ${featured ? "w-64" : "w-56"}`}>
      <div className={`rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 ${featured ? "w-24 h-24 text-3xl" : "w-16 h-16 text-2xl"}`}>
        {member.name.charAt(0).toUpperCase()}
      </div>
      <h3 className={`font-bold text-slate-900 mt-4 mb-1 ${featured ? "text-xl" : "text-base"}`}>
        {member.name}
      </h3>
      <span className="inline-flex text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-slate-100 text-slate-700 capitalize mb-2">
        {member.designation}
      </span>
      <p className="text-xs text-slate-500 mb-3">{member.department}</p>
      
      <div className="flex items-center gap-2 justify-center text-xs text-slate-500 mt-auto">
        <Mail className="w-3 h-3" /> {member.email}
      </div>
    </div>
  );
}
