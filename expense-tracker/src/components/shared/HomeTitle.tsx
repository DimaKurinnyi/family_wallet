import React from 'react'
import { Title } from './Title';
import { ButtonGroup } from './ButtonGroup';
import { About } from './About';
interface Props{
    className?: string;
}

export const HomeTitle: React.FC<Props> = ({className}) => {
  return (
     <div className=" flex flex-col items-center justify-center min-h-screen">
        <Title text="Welcome to Expense Tracker" size="2xl" className="text-white font-bold"/>
        <Title text="create-next-app for you and your family" size="sm" className="text-gray-600 font-medium"/>  
        <ButtonGroup/>

        <About className='mt-6'/>
      </div>
  )
}
