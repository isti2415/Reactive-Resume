import { zodResolver } from "@hookform/resolvers/zod";
import { t } from "@lingui/macro";
import { CaretDown, Flask, MagicWand, Plus } from "@phosphor-icons/react";
import type { PortfolioDto } from "@reactive-resume/dto";
import { createPortfolioSchema } from "@reactive-resume/dto";
import { idSchema, samplePortfolio } from "@reactive-resume/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Tooltip,
} from "@reactive-resume/ui";
import { cn, generateRandomName } from "@reactive-resume/utils";
import slugify from "@sindresorhus/slugify";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  useCreatePortfolio,
  useDeletePortfolio,
  useImportPortfolio,
  useUpdatePortfolio,
} from "@/client/services/portfolio";
import { useDialog } from "@/client/stores/dialog";

const formSchema = createPortfolioSchema.extend({ id: idSchema.optional(), slug: z.string() });

type FormValues = z.infer<typeof formSchema>;

export const PortfolioDialog = () => {
  const { isOpen, mode, payload, close } = useDialog<PortfolioDto>("portfolio");

  const isCreate = mode === "create";
  const isUpdate = mode === "update";
  const isDelete = mode === "delete";
  const isDuplicate = mode === "duplicate";

  const { createPortfolio, loading: createLoading } = useCreatePortfolio();
  const { updatePortfolio, loading: updateLoading } = useUpdatePortfolio();
  const { deletePortfolio, loading: deleteLoading } = useDeletePortfolio();
  const { importPortfolio: duplicatePortfolio, loading: duplicateLoading } = useImportPortfolio();

  const loading = createLoading || updateLoading || deleteLoading || duplicateLoading;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", slug: "" },
  });

  useEffect(() => {
    if (isOpen) onReset();
  }, [isOpen, payload]);

  useEffect(() => {
    const slug = slugify(form.watch("title"));
    form.setValue("slug", slug);
  }, [form.watch("title")]);

  const onSubmit = async (values: FormValues) => {
    if (isCreate) {
      await createPortfolio({ slug: values.slug, title: values.title, visibility: "private" });
    }

    if (isUpdate) {
      if (!payload.item?.id) return;

      await updatePortfolio({
        id: payload.item.id,
        title: values.title,
        slug: values.slug,
      });
    }

    if (isDelete) {
      if (!payload.item?.id) return;

      await deletePortfolio({ id: payload.item.id });
    }

    close();
  };

  const onReset = () => {
    if (isCreate) form.reset({ title: "", slug: "" });
    if (isUpdate)
      form.reset({ id: payload.item?.id, title: payload.item?.title, slug: payload.item?.slug });
    if (isDuplicate)
      form.reset({ title: `${payload.item?.title} (Copy)`, slug: `${payload.item?.slug}-copy` });
    if (isDelete)
      form.reset({ id: payload.item?.id, title: payload.item?.title, slug: payload.item?.slug });
  };

  const onGenerateRandomName = () => {
    const name = generateRandomName();
    form.setValue("title", name);
    form.setValue("slug", slugify(name));
  };

  const onCreateSample = async () => {
    const randomName = generateRandomName();

    await duplicatePortfolio({
      title: randomName,
      slug: slugify(randomName),
      data: samplePortfolio,
    });

    close();
  };

  if (isDelete) {
    return (
      <AlertDialog open={isOpen} onOpenChange={close}>
        <AlertDialogContent>
          <Form {...form}>
            <form>
              <AlertDialogHeader>
                <AlertDialogTitle>{t`Are you sure you want to delete your portfolio?`}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t`This action cannot be undone. This will permanently delete your portfolio and cannot be recovered.`}
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>{t`Cancel`}</AlertDialogCancel>
                <AlertDialogAction variant="error" onClick={form.handleSubmit(onSubmit)}>
                  {t`Delete`}
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                <div className="flex items-center space-x-2.5">
                  <Plus />
                  <h2>
                    {isCreate && t`Create a new portfolio`}
                    {isUpdate && t`Update an existing portfolio`}
                    {isDuplicate && t`Duplicate an existing portfolio`}
                  </h2>
                </div>
              </DialogTitle>
              <DialogDescription>
                {isCreate && t`Start building your resume by giving it a name.`}
                {isUpdate && t`Changed your mind about the name? Give it a new one.`}
                {isDuplicate && t`Give your old resume a new name.`}
              </DialogDescription>
            </DialogHeader>

            <FormField
              name="title"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t`Title`}</FormLabel>
                  <FormControl>
                    <div className="flex items-center justify-between gap-x-2">
                      <Input {...field} className="flex-1" />

                      {(isCreate || isDuplicate) && (
                        <Tooltip content={t`Generate a random title for your portfolio`}>
                          <Button
                            size="icon"
                            type="button"
                            variant="outline"
                            onClick={onGenerateRandomName}
                          >
                            <MagicWand />
                          </Button>
                        </Tooltip>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    {t`Tip: You can name the portfolio referring to the position you are applying for.`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="slug"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t`Slug`}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <div className="flex items-center">
                <Button
                  type="submit"
                  disabled={loading}
                  className={cn(isCreate && "rounded-r-none")}
                >
                  {isCreate && t`Create`}
                  {isUpdate && t`Save Changes`}
                  {isDuplicate && t`Duplicate`}
                </Button>

                {isCreate && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" size="icon" className="rounded-l-none border-l">
                        <CaretDown />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="center">
                      <DropdownMenuItem onClick={onCreateSample}>
                        <Flask className="mr-2" />
                        {t`Create Sample Portfolio`}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
