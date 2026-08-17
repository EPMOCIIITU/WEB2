"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import AddMemberModal from "./AddMemberModal";
import { MemberDirectoryTable } from "./MemberDirectoryTable";

type Member = Parameters<typeof MemberDirectoryTable>[0]["members"][number];

export default function MembersPageClient({ members }: { members: Member[] }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Member Directory</h2>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <UserPlus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      <MemberDirectoryTable members={members} />

      {showModal && <AddMemberModal onClose={() => setShowModal(false)} />}
    </>
  );
}
