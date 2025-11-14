"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import Calendar from "./components/Calendar";


export default function Home() {

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  

  return (
    <Calendar refreshTrigger={refreshTrigger} />
    
  );
}
