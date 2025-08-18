'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { changePasswordApi } from '@/apis/user';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoaderCircle } from 'lucide-react';

export function AccountForm() {
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const formValues = {
      password: formData.get('current') as string,
      newPassword: formData.get('new') as string,
    };

    const result = await changePasswordApi(formValues);

    if (result.isSuccess) {
      toast.success(result?.message);
    } else {
      toast.error(result.message);
    }

    setIsLoading(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Change your password here.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleChangePassword} className="grid gap-4">
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="current">Current password</Label>
              <Input id="current" name="current" type="password" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">New password</Label>
              <Input id="new" name="new" type="password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
              ) : (
                'Save Password'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </>
  );
}
