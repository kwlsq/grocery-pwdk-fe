"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProductStore } from '@/store/productStore';
import { CreateCategoryRequest } from '@/types/product';

export default function CreateCategoryDialog() {
  const { categories, fetchCategories, createCategory } = useProductStore();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [parentID, setParentID] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen, fetchCategories]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className='flex flex-col gap-2'>
            <Label htmlFor='category-name'>Name</Label>
            <Input id='category-name' placeholder='e.g. Beverages' value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className='flex flex-col gap-2'>
            <Label>Parent Category (optional)</Label>
            <Select value={parentID || 'none'} onValueChange={(value) => setParentID(value === 'none' ? '' : value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="No parent" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Parent</SelectLabel>
                  <SelectItem value="none">No parent</SelectItem>
                  {categories
                    .filter((c) => Boolean(c?.id))
                    .map((c, idx) => (
                      <SelectItem key={c.id || `${c.name}-${idx}`} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (!name.trim()) return;
              try {
                const newCategory: CreateCategoryRequest = {
                  name: name.trim(),
                  ...(parentID ? { parentID } : {}),
                };

                console.log(newCategory);
                await createCategory(newCategory);
              } finally {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('categories');
                }
                await fetchCategories();
                setName('');
                setParentID('');
                setIsOpen(false);
              }
            }}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


