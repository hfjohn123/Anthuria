import { Button, Input } from '@headlessui/react';
import { useState } from 'react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  return (
    <form className="flex flex-col justify-center gap-4 items-center h-screen">
      <h3>Please Enter your New Password</h3>
      <Input
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <Button
        className=""
        onClick={() => {
          console.log(password);
        }}
      >
        Submit
      </Button>
    </form>
  );
}
