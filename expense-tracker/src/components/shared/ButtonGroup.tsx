import React from 'react'
import { Button } from '../ui/button';
interface Props{
    className?: string;
}

export const ButtonGroup: React.FC<Props> = ({className}) => {
  return (
    <div className={`mt-6 flex space-x-4 ${className}`}>
      <Button variant="link" size="lg" className="mr-4 cursor-pointer font-bold ">Sign in</Button>
      <Button variant="default" size="lg" className='cursor-pointer'>Sign up</Button>
    </div>
  )
}
