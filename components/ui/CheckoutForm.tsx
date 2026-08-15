'use client'

import { useState } from 'react'
import { LoaderCircle } from 'lucide-react'

export function CheckoutForm({courseId,label}:{courseId:string,label:string}){
 const [pending,setPending]=useState(false)
 return <form action="/api/checkout" method="POST" className="full-form" onSubmit={()=>setPending(true)}>
   <input type="hidden" name="course_id" value={courseId}/>
   <button type="submit" className={`btn full-btn${pending?' is-loading':''}`} disabled={pending} aria-busy={pending}>
     {pending&&<LoaderCircle className="button-spinner" size={15}/>}<span>{pending?'ABRINDO CHECKOUT...':label}</span>
   </button>
 </form>
}
