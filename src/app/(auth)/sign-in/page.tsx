'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import { signInSchema, otpSchema } from '../../../schemas/signinSchema';

export default function SignInForm() {
  const router = useRouter();
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [userId, setUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const credentialsForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
      userId: '',
    },
  });

  const onCredentialsSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: data.identifier,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || 'Failed to send OTP');
        setIsLoading(false);
        return;
      }

      setUserId(result.userId);
      otpForm.setValue('userId', result.userId);
      toast.success('OTP sent to your email');
      setStep('otp');
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onOTPSubmit = async (data: z.infer<typeof otpSchema>) => {
    setIsLoading(true);
    try {
      // First verify OTP on the backend
      const verifyResponse = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: data.userId,
          otp: data.otp,
        }),
      });

      const verifyResult = await verifyResponse.json();

      if (!verifyResponse.ok) {
        toast.error(verifyResult.message || 'Invalid OTP');
        setIsLoading(false);
        return;
      }

      // Now sign in with NextAuth using OTP
      const signInResult = await signIn('credentials', {
        redirect: false,
        userId: data.userId,
        otp: data.otp,
      });

      if (signInResult?.error) {
        toast.error(signInResult.error || 'An error occurred');
        setIsLoading(false);
        return;
      }

      if (signInResult?.url) {
        toast.success('Logged in successfully!');
        router.replace('/dashboard');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    const identifier = credentialsForm.getValues('identifier');
    const password = credentialsForm.getValues('password');

    if (!identifier || !password) {
      toast.error('Please enter your credentials first');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || 'Failed to resend OTP');
        return;
      }

      toast.success('OTP resent to your email');
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white">
      {/* 🔹 FULL-SCREEN BACKGROUND VIDEO */}
      <video
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        src="/video/backend-1.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Dark overlay over whole page */}
      <div className="pointer-events-none absolute inset-0 bg-black/55" />

      {/* 🔹 Foreground content */}
      <div className="relative z-10 flex w-full max-w-6xl flex-col gap-16 px-8 py-12 md:flex-row md:items-center md:justify-center">
        {/* LEFT: CLOAK CHAT with video INSIDE text */}
        <div className="hidden md:flex flex-1 flex-col space-y-4">
          {/* Plain text logo */}
          <h1
            className="
              text-[7vw] lg:text-[5vw]
              font-black tracking-[0.25em] uppercase leading-tight
              text-white
            "
          >
            CLOAK
            <br />
            CHAT
          </h1>

          <p className="max-w-md text-sm md:text-base text-slate-200">
            Share and receive anonymous thoughts without losing trust.
            Honest conversations, beautifully hidden.
          </p>
        </div>

        {/* RIGHT: sign-in card */}
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-md rounded-xl bg-slate-950/85 p-8 shadow-2xl border border-slate-800 backdrop-blur-xl">
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Welcome Back
              </h1>
              <p className="mt-2 text-sm text-slate-300">
                Sign in to continue your secret conversations
              </p>
            </div>

            {/* STEP 1: Credentials */}
            {step === 'credentials' && (
              <Form {...credentialsForm}>
                <form
                  onSubmit={credentialsForm.handleSubmit(onCredentialsSubmit)}
                  className="space-y-5"
                >
                  <FormField
                    name="identifier"
                    control={credentialsForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email / Username</FormLabel>
                        <Input
                          {...field}
                          disabled={isLoading}
                          className="bg-slate-900/80 border-slate-700 focus-visible:ring-sky-400"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="password"
                    control={credentialsForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <Input
                          type="password"
                          {...field}
                          disabled={isLoading}
                          className="bg-slate-900/80 border-slate-700 focus-visible:ring-sky-400"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    className="w-full bg-sky-500 hover:bg-sky-400 text-black font-semibold disabled:opacity-50"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending OTP...' : 'Continue'}
                  </Button>
                </form>
              </Form>
            )}

            {/* STEP 2: OTP Verification */}
            {step === 'otp' && (
              <Form {...otpForm}>
                <form
                  onSubmit={otpForm.handleSubmit(onOTPSubmit)}
                  className="space-y-5"
                >
                  <div className="bg-sky-500/10 border border-sky-500/30 rounded-lg p-4 mb-4">
                    <p className="text-sm text-sky-200">
                      We've sent a 6-digit OTP to your email. Please enter it
                      below to verify your identity.
                    </p>
                  </div>

                  <FormField
                    name="otp"
                    control={otpForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enter OTP</FormLabel>
                        <Input
                          {...field}
                          placeholder="000000"
                          maxLength={6}
                          disabled={isLoading}
                          className="bg-slate-900/80 border-slate-700 focus-visible:ring-sky-400 text-center text-2xl tracking-widest"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    className="w-full bg-sky-500 hover:bg-sky-400 text-black font-semibold disabled:opacity-50"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </Button>

                  <div className="flex gap-2 text-sm">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-900"
                      onClick={() => setStep('credentials')}
                      disabled={isLoading}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-900"
                      onClick={handleResendOTP}
                      disabled={isLoading}
                    >
                      Resend OTP
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            <div className="text-center mt-5 text-sm text-slate-300">
              <p>
                Not a member yet?{' '}
                <Link
                  href="/sign-up"
                  className="font-semibold text-sky-300 hover:text-sky-200"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  );
}
