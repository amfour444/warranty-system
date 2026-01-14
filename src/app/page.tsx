import { redirect } from "next/navigation";

export default function Home() {
  // สั่งให้กระโดดไปหน้า Login ทันที
  redirect("/login");
}