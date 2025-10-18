// app/pets/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PetDetail from '../../../../components/PetGallery/PetDetail';
import { getAllPets, getPetBySlug } from '../../../../lib/pets';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pet = await getPetBySlug(params.slug);

  if (!pet) {
    return { title: 'Pet Not Found' };
  }

  return {
    title: `${pet.name} - ${pet.breed} | PetRescue Success Story`,
    description: `${pet.story} Learn how ${pet.name}, a ${pet.breed} from ${pet.location}, was kept safe with PetRescue tags.`,
    keywords: `${pet.name}, ${pet.breed}, pet safety, lost pet, pet reunion, ${pet.type}, pet tracking, ${pet.location}`,
    openGraph: {
      title: `${pet.name} - ${pet.breed}`,
      description: pet.story,
      images: [pet.image],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pet.name} - ${pet.breed}`,
      description: pet.story,
      images: [pet.image],
    },
  };
}

export async function generateStaticParams() {
  const pets = await getAllPets();
  return pets.map((pet) => ({
    slug: pet.slug,
  }));
}

const PetDetailPage = async ({ params }: Props) => {
  const pet = await getPetBySlug(params.slug);

  if (!pet) {
    notFound();
  }

  return <PetDetail pet={pet} />;
};

export default PetDetailPage;
