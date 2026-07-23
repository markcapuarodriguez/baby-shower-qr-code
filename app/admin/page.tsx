import type { Metadata } from "next";
import { AdminApp } from "./AdminApp";
import "./admin.css";

export const metadata: Metadata = {
  title: "Organizer Dashboard",
  description: "Manage the baby shower invitation, RSVPs, gifts, and reservations.",
};

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return <AdminApp />;
}
