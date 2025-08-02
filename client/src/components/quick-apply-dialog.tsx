import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/query-client';
import { type ProgramWithUniversity } from '@shared/schema';

const quickApplySchema = z.object({
  studentFirstName: z.string().min(1, 'First name is required'),
  studentLastName: z.string().min(1, 'Last name is required'),
  studentEmail: z.string().email('Valid email is required'),
  studentPhone: z.string().min(1, 'Phone number is required'),
  studentDateOfBirth: z.string().min(1, 'Date of birth is required'),
  studentNationality: z.string().min(1, 'Nationality is required'),
  studentGender: z.enum(['Male', 'Female', 'Other']),
  highestQualification: z.string().min(1, 'Highest qualification is required'),
  qualificationName: z.string().min(1, 'Qualification name is required'),
  institutionName: z.string().min(1, 'Institution name is required'),
  graduationYear: z.string().min(1, 'Graduation year is required'),
  cgpa: z.string().optional(),
  intakeDate: z.string().min(1, 'Intake date is required'),
  notes: z.string().optional(),
});

type QuickApplyForm = z.infer<typeof quickApplySchema>;

interface QuickApplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: ProgramWithUniversity;
}

export default function QuickApplyDialog({ open, onOpenChange, program }: QuickApplyDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<QuickApplyForm>({
    resolver: zodResolver(quickApplySchema),
    defaultValues: {
      intakeDate: program.intake || '',
    },
  });

  const createApplicationMutation = useMutation({
    mutationFn: async (data: QuickApplyForm) => {
      const response = await apiRequest('POST', '/api/applications', {
        ...data,
        programId: program.id,
        status: 'draft',
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Application Submitted',
        description: 'Your application has been successfully submitted as a draft.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit application. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: QuickApplyForm) => {
    createApplicationMutation.mutate(data);
  };

  const handleClose = () => {
    if (!createApplicationMutation.isPending) {
      reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick Apply - {program.name}</DialogTitle>
          <DialogDescription>
            Apply quickly to {program.university?.name}. You can save this as a draft and complete it later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Personal Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studentFirstName">First Name *</Label>
                <Input
                  id="studentFirstName"
                  {...register('studentFirstName')}
                  className={errors.studentFirstName ? 'border-red-500' : ''}
                />
                {errors.studentFirstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.studentFirstName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="studentLastName">Last Name *</Label>
                <Input
                  id="studentLastName"
                  {...register('studentLastName')}
                  className={errors.studentLastName ? 'border-red-500' : ''}
                />
                {errors.studentLastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.studentLastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="studentEmail">Email *</Label>
              <Input
                id="studentEmail"
                type="email"
                {...register('studentEmail')}
                className={errors.studentEmail ? 'border-red-500' : ''}
              />
              {errors.studentEmail && (
                <p className="text-red-500 text-sm mt-1">{errors.studentEmail.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="studentPhone">Phone Number *</Label>
              <Input
                id="studentPhone"
                {...register('studentPhone')}
                className={errors.studentPhone ? 'border-red-500' : ''}
              />
              {errors.studentPhone && (
                <p className="text-red-500 text-sm mt-1">{errors.studentPhone.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studentDateOfBirth">Date of Birth *</Label>
                <Input
                  id="studentDateOfBirth"
                  type="date"
                  {...register('studentDateOfBirth')}
                  className={errors.studentDateOfBirth ? 'border-red-500' : ''}
                />
                {errors.studentDateOfBirth && (
                  <p className="text-red-500 text-sm mt-1">{errors.studentDateOfBirth.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="studentGender">Gender *</Label>
                <Select onValueChange={(value) => setValue('studentGender', value as any)}>
                  <SelectTrigger className={errors.studentGender ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.studentGender && (
                  <p className="text-red-500 text-sm mt-1">{errors.studentGender.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="studentNationality">Nationality *</Label>
              <Input
                id="studentNationality"
                {...register('studentNationality')}
                className={errors.studentNationality ? 'border-red-500' : ''}
              />
              {errors.studentNationality && (
                <p className="text-red-500 text-sm mt-1">{errors.studentNationality.message}</p>
              )}
            </div>
          </div>

          {/* Academic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Academic Information</h3>
            
            <div>
              <Label htmlFor="highestQualification">Highest Qualification *</Label>
              <Select onValueChange={(value) => setValue('highestQualification', value)}>
                <SelectTrigger className={errors.highestQualification ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select qualification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High School">High School</SelectItem>
                  <SelectItem value="Diploma">Diploma</SelectItem>
                  <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                  <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                </SelectContent>
              </Select>
              {errors.highestQualification && (
                <p className="text-red-500 text-sm mt-1">{errors.highestQualification.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="qualificationName">Qualification Name *</Label>
              <Input
                id="qualificationName"
                {...register('qualificationName')}
                placeholder="e.g., Bachelor of Science in Computer Science"
                className={errors.qualificationName ? 'border-red-500' : ''}
              />
              {errors.qualificationName && (
                <p className="text-red-500 text-sm mt-1">{errors.qualificationName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="institutionName">Institution Name *</Label>
              <Input
                id="institutionName"
                {...register('institutionName')}
                className={errors.institutionName ? 'border-red-500' : ''}
              />
              {errors.institutionName && (
                <p className="text-red-500 text-sm mt-1">{errors.institutionName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="graduationYear">Graduation Year *</Label>
                <Input
                  id="graduationYear"
                  {...register('graduationYear')}
                  placeholder="e.g., 2023"
                  className={errors.graduationYear ? 'border-red-500' : ''}
                />
                {errors.graduationYear && (
                  <p className="text-red-500 text-sm mt-1">{errors.graduationYear.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cgpa">CGPA/GPA (Optional)</Label>
                <Input
                  id="cgpa"
                  {...register('cgpa')}
                  placeholder="e.g., 3.5"
                />
              </div>
            </div>
          </div>

          {/* Application Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Application Details</h3>
            
            <div>
              <Label htmlFor="intakeDate">Preferred Intake *</Label>
              <Input
                id="intakeDate"
                {...register('intakeDate')}
                className={errors.intakeDate ? 'border-red-500' : ''}
              />
              {errors.intakeDate && (
                <p className="text-red-500 text-sm mt-1">{errors.intakeDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Any additional information or special requirements..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createApplicationMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createApplicationMutation.isPending}
            >
              {createApplicationMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}