import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useGenerateCoverLetter } from '@/services/cover-letter/generate';
import { useCoverLetterStore } from '@/stores/cover-letter';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  experience: z.string().min(50, 'Please provide more details about your experience'),
  jobDescription: z.string().min(50, 'Please provide more details about the job'),
});

type FormValues = z.infer<typeof formSchema>;

export const CoverLetterForm = () => {
  const { generateCoverLetter, isLoading } = useGenerateCoverLetter();
  const setCoverLetter = useCoverLetterStore((state) => state.setCoverLetter);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      experience: '',
      jobDescription: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const { content } = await generateCoverLetter(values);
      setCoverLetter(content);
      toast.success('Cover letter generated successfully!');
    } catch (error) {
      // Error is already handled in the service
    }
  };

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="experience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Experience & Skills</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your relevant experience and skills..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="jobDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Paste the job description here..."
                    className="min-h-[150px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate Cover Letter'}
          </Button>
        </form>
      </Form>
    </Card>
  );
};
