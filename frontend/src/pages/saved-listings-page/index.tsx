import {
  Badge,
  Box,
  CloseButton,
  DataList,
  Drawer,
  HStack,
  Link,
  Portal,
  Table,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';

import CompanyLogo from '@/components/custom/CompanyLogo';
import type { Listing } from '@/types/listing';
import type { ISODate } from '@/utils/date';

type ApplicationStatus = 'saved' | 'applied' | 'interview-1' | 'interview-2' | 'offer' | 'rejected';

type ListingWithStatus = Listing & { status: ApplicationStatus };

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; colorPalette: string }> = {
  saved: { label: 'Saved', colorPalette: 'gray' },
  applied: { label: 'Applied', colorPalette: 'blue' },
  'interview-1': { label: 'Interview 1', colorPalette: 'purple' },
  'interview-2': { label: 'Interview 2', colorPalette: 'purple' },
  offer: { label: 'Offer', colorPalette: 'green' },
  rejected: { label: 'Rejected', colorPalette: 'red' },
};

// Dummy listings for testing
const DUMMY_LISTINGS: ListingWithStatus[] = [
  {
    id: '1',
    url: 'https://careers.google.com/jobs/1',
    title: 'Senior Frontend Engineer',
    company: 'Google LLC',
    domain: 'google.com',
    location: 'Mountain View, CA',
    description:
      'We are looking for a Senior Frontend Engineer to join our team and help build the next generation of our product. You will work closely with designers and backend engineers to deliver exceptional user experiences.',
    postedDate: '2024-12-01' as ISODate,
    skills: ['React', 'TypeScript', 'CSS', 'GraphQL', 'Node.js'],
    requirements: [
      '5+ years of frontend development experience',
      'Strong proficiency in React and TypeScript',
      'Experience with design systems',
      'Excellent communication skills',
    ],
    resumeIds: ['resume-1'],
    status: 'interview-2',
  },
  {
    id: '2',
    url: 'https://jobs.netflix.com/jobs/2',
    title: 'Full Stack Developer',
    company: 'Netflix Inc.',
    domain: 'netflix.com',
    location: 'Remote',
    description:
      'Join our fast-growing team as a Full Stack Developer. You will be responsible for building features end-to-end and contributing to our product roadmap.',
    postedDate: '2024-11-28' as ISODate,
    skills: ['Python', 'Django', 'React', 'PostgreSQL', 'AWS'],
    requirements: [
      '3+ years of full stack development',
      'Experience with Python and JavaScript frameworks',
      'Familiarity with cloud services',
    ],
    resumeIds: [],
    status: 'applied',
  },
  {
    id: '3',
    url: 'https://jobs.microsoft.com/jobs/3',
    title: 'Backend Engineer',
    company: 'Microsoft Corporation',
    domain: 'microsoft.com',
    location: 'Redmond, WA',
    description:
      'We need a Backend Engineer to help scale our data processing infrastructure. You will design and implement high-performance APIs and services.',
    postedDate: '2024-11-25' as ISODate,
    skills: ['Go', 'Kubernetes', 'gRPC', 'Redis', 'Kafka'],
    requirements: [
      '4+ years of backend development',
      'Experience with distributed systems',
      'Strong understanding of system design',
      'Experience with containerization',
    ],
    resumeIds: ['resume-2', 'resume-3'],
    status: 'offer',
  },
  {
    id: '4',
    url: 'https://jobs.amazon.com/jobs/4',
    title: 'DevOps Engineer',
    company: 'Amazon Web Services',
    domain: 'aws.amazon.com',
    location: 'Seattle, WA',
    description:
      'Looking for a DevOps Engineer to improve our CI/CD pipelines and infrastructure automation. You will work on making our deployments faster and more reliable.',
    postedDate: '2024-11-20' as ISODate,
    skills: ['Terraform', 'AWS', 'Docker', 'GitHub Actions', 'Python'],
    requirements: [
      '3+ years of DevOps experience',
      'Strong knowledge of AWS services',
      'Experience with infrastructure as code',
    ],
    resumeIds: [],
    status: 'rejected',
  },
  {
    id: '5',
    url: 'https://careers.nvidia.com/jobs/5',
    title: 'Machine Learning Engineer',
    company: 'NVIDIA Corporation',
    domain: 'nvidia.com',
    location: 'Santa Clara, CA',
    description:
      'Join our ML team to develop and deploy machine learning models at scale. You will work on cutting-edge NLP and computer vision projects.',
    postedDate: '2024-11-15' as ISODate,
    skills: ['Python', 'PyTorch', 'TensorFlow', 'MLOps', 'SQL'],
    requirements: [
      'MS or PhD in Computer Science or related field',
      '2+ years of ML engineering experience',
      'Experience deploying models to production',
      'Strong mathematical foundations',
    ],
    resumeIds: ['resume-4'],
    status: 'saved',
  },
  {
    id: '6',
    url: 'https://careers.salesforce.com/jobs/6',
    title: 'Product Manager',
    company: 'Salesforce Inc.',
    domain: 'salesforce.com',
    location: 'San Francisco, CA',
    description:
      'Lead product strategy and development for our flagship platform. You will work with engineering, design, and marketing to deliver world-class products.',
    postedDate: '2024-11-10' as ISODate,
    skills: ['Product Strategy', 'Data Analysis', 'Leadership', 'Communication'],
    requirements: [
      '5+ years of product management experience',
      'Experience with SaaS products',
      'Strong analytical skills',
      'Proven track record of successful product launches',
    ],
    resumeIds: [],
    status: 'applied',
  },
  {
    id: '7',
    url: 'https://jobs.ibm.com/jobs/7',
    title: 'QA Engineer',
    company: 'IBM Corporation',
    domain: 'ibm.com',
    location: 'Austin, TX',
    description:
      'Ensure product quality through comprehensive testing and automation. You will design and implement test strategies for our core products.',
    postedDate: '2024-11-08' as ISODate,
    skills: ['Selenium', 'Python', 'TestNG', 'CI/CD', 'Jira'],
    requirements: [
      '3+ years of QA automation experience',
      'Proficiency in multiple programming languages',
      'Experience with test automation frameworks',
    ],
    resumeIds: [],
    status: 'interview-1',
  },
  {
    id: '8',
    url: 'https://careers.adobe.com/jobs/8',
    title: 'UX/UI Designer',
    company: 'Adobe Inc.',
    domain: 'adobe.com',
    location: 'San Jose, CA',
    description:
      'Create beautiful and intuitive user experiences for mobile and web applications. You will collaborate with product and engineering teams.',
    postedDate: '2024-11-05' as ISODate,
    skills: ['Figma', 'Prototyping', 'User Research', 'Design Systems'],
    requirements: [
      '4+ years of UX/UI design experience',
      'Portfolio demonstrating design process and thinking',
      'Experience with design systems',
    ],
    resumeIds: ['resume-5'],
    status: 'saved',
  },
  {
    id: '9',
    url: 'https://careers.oracle.com/jobs/9',
    title: 'Database Administrator',
    company: 'Oracle Corporation',
    domain: 'oracle.com',
    location: 'Redwood City, CA',
    description:
      'Manage and optimize our database infrastructure. You will ensure data security, performance, and availability for enterprise clients.',
    postedDate: '2024-11-02' as ISODate,
    skills: ['PostgreSQL', 'MongoDB', 'AWS RDS', 'Backup & Recovery', 'Shell Scripting'],
    requirements: [
      '5+ years of DBA experience',
      'Deep knowledge of relational and NoSQL databases',
      'Experience with cloud database services',
    ],
    resumeIds: [],
    status: 'rejected',
  },
  {
    id: '10',
    url: 'https://careers.paloaltonetworks.com/jobs/10',
    title: 'Security Engineer',
    company: 'Palo Alto Networks',
    domain: 'paloaltonetworks.com',
    location: 'Santa Clara, CA',
    description:
      'Protect our systems and data from cyber threats. You will implement security best practices and conduct vulnerability assessments.',
    postedDate: '2024-10-30' as ISODate,
    skills: ['Network Security', 'Penetration Testing', 'OWASP', 'SSL/TLS', 'Linux'],
    requirements: [
      '4+ years of security engineering experience',
      'Certifications such as CISSP or CEH',
      'Experience with security tools and frameworks',
    ],
    resumeIds: ['resume-6'],
    status: 'applied',
  },
  {
    id: '11',
    url: 'https://careers.linkedin.com/jobs/11',
    title: 'Data Scientist',
    company: 'LinkedIn Corporation',
    domain: 'linkedin.com',
    location: 'Remote',
    description:
      'Build predictive models and data pipelines for business intelligence. You will work with large datasets and modern ML tools.',
    postedDate: '2024-10-28' as ISODate,
    skills: ['Python', 'R', 'Scikit-learn', 'Spark', 'SQL', 'Tableau'],
    requirements: [
      "PhD or Master's in relevant field or 5+ years experience",
      'Strong statistical background',
      'Experience with big data technologies',
    ],
    resumeIds: [],
    status: 'saved',
  },
  {
    id: '12',
    url: 'https://careers.deloitte.com/jobs/12',
    title: 'Solutions Architect',
    company: 'Deloitte LLP',
    domain: 'deloitte.com',
    location: 'Boston, MA',
    description:
      'Design and implement enterprise solutions for our clients. You will work closely with sales and technical teams.',
    postedDate: '2024-10-25' as ISODate,
    skills: ['Cloud Architecture', 'Azure', 'Kubernetes', 'Microservices', 'API Design'],
    requirements: [
      '7+ years of architecture experience',
      'Cloud certifications (AWS or Azure)',
      'Experience with enterprise integrations',
    ],
    resumeIds: [],
    status: 'interview-1',
  },
  {
    id: '13',
    url: 'https://careers.apple.com/jobs/13',
    title: 'Mobile Developer (iOS)',
    company: 'Apple Inc.',
    domain: 'apple.com',
    location: 'Cupertino, CA',
    description:
      'Develop native iOS applications. You will work in a fast-paced environment with modern development tools and practices.',
    postedDate: '2024-10-22' as ISODate,
    skills: ['Swift', 'Objective-C', 'Xcode', 'UIKit', 'CocoaPods'],
    requirements: [
      '3+ years of iOS development experience',
      'Published apps on App Store',
      'Experience with Swift and modern iOS frameworks',
    ],
    resumeIds: ['resume-7'],
    status: 'applied',
  },
  {
    id: '14',
    url: 'https://careers.twilio.com/jobs/14',
    title: 'Technical Writer',
    company: 'Twilio Inc.',
    domain: 'twilio.com',
    location: 'Portland, OR',
    description:
      'Create technical documentation and API guides. You will translate complex technical concepts into clear, user-friendly content.',
    postedDate: '2024-10-20' as ISODate,
    skills: ['Technical Writing', 'Markdown', 'API Documentation', 'Git', 'JIRA'],
    requirements: [
      '3+ years of technical writing experience',
      'Experience documenting APIs and software products',
      'Strong communication skills',
    ],
    resumeIds: [],
    status: 'saved',
  },
  {
    id: '15',
    url: 'https://careers.spotify.com/jobs/15',
    title: 'Site Reliability Engineer',
    company: 'Spotify AB',
    domain: 'spotify.com',
    location: 'New York, NY',
    description:
      'Ensure reliability and performance of our production systems. You will automate operational tasks and improve system resilience.',
    postedDate: '2024-10-18' as ISODate,
    skills: ['Kubernetes', 'Prometheus', 'ELK Stack', 'Go', 'Terraform'],
    requirements: [
      '4+ years of SRE or DevOps experience',
      'Deep knowledge of containerization and orchestration',
      'Experience with monitoring and observability tools',
    ],
    resumeIds: ['resume-8'],
    status: 'offer',
  },
];

export default function SavedListingsPage() {
  const [selectedListing, setSelectedListing] = useState<ListingWithStatus | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use dummy data instead of fetching from DB
  const listings = DUMMY_LISTINGS;

  const handleRowClick = (listing: ListingWithStatus) => {
    if (selectedListing?.id === listing.id) {
      // Clicking same row toggles drawer
      setIsDrawerOpen(!isDrawerOpen);
    } else {
      setSelectedListing(listing);
      setIsDrawerOpen(true);
    }
  };

  return (
    <Box ref={containerRef} w="full" h="full" position="relative" overflow="hidden">
      {/* Table */}
      <Box w="full" h="full" overflowX="auto" overflowY="auto">
        <Table.Root variant="outline" size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader minW="150px">Company</Table.ColumnHeader>
              <Table.ColumnHeader minW="250px">Title</Table.ColumnHeader>
              <Table.ColumnHeader minW="150px">Location</Table.ColumnHeader>
              <Table.ColumnHeader minW="120px">Posted</Table.ColumnHeader>
              <Table.ColumnHeader minW="120px">Status</Table.ColumnHeader>
              <Table.ColumnHeader minW="100px" textAlign="center">
                Skills
              </Table.ColumnHeader>
              <Table.ColumnHeader minW="150px">Source</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {listings.map((listing) => (
              <Table.Row
                key={listing.id}
                onClick={() => handleRowClick(listing)}
                cursor="pointer"
                bg={selectedListing?.id === listing.id && isDrawerOpen ? 'bg.subtle' : undefined}
                _hover={{ bg: 'bg.muted' }}
                transition="background 0.15s ease"
              >
                <Table.Cell minW="150px">
                  <CompanyLogo domain={listing.domain} companyName={listing.company} mr="2" />
                  {listing.company}
                </Table.Cell>
                <Table.Cell minW="250px">{listing.title}</Table.Cell>
                <Table.Cell minW="150px">{listing.location}</Table.Cell>
                <Table.Cell minW="120px">{listing.postedDate}</Table.Cell>
                <Table.Cell minW="120px">
                  <Badge size="sm" colorPalette={STATUS_CONFIG[listing.status].colorPalette}>
                    {STATUS_CONFIG[listing.status].label}
                  </Badge>
                </Table.Cell>
                <Table.Cell minW="100px" textAlign="center">
                  <Badge size="sm" variant="subtle" colorPalette="gray">
                    {listing.skills.length}
                  </Badge>
                </Table.Cell>
                <Table.Cell minW="150px">
                  <Link
                    href={listing.url}
                    target="_blank"
                    color="blue.500"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {new URL(listing.url).hostname}
                  </Link>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      {/* Drawer for listing details - modal, blocks outside interaction */}
      <Drawer.Root
        open={isDrawerOpen}
        onOpenChange={(e) => setIsDrawerOpen(e.open)}
        placement="end"
        size="md"
      >
        <Portal container={containerRef}>
          <Drawer.Backdrop pos="absolute" boxSize="full" />
          <Drawer.Positioner pos="absolute" boxSize="full">
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title>{selectedListing?.title}</Drawer.Title>
                <Text fontWeight="semibold" color="gray.600" _dark={{ color: 'gray.400' }}>
                  {selectedListing?.company}
                </Text>
              </Drawer.Header>

              <Drawer.Body>
                {selectedListing && (
                  <VStack align="stretch" gap="6">
                    <DataList.Root orientation="horizontal">
                      {selectedListing.location && (
                        <DataList.Item>
                          <DataList.ItemLabel>Location</DataList.ItemLabel>
                          <DataList.ItemValue>{selectedListing.location}</DataList.ItemValue>
                        </DataList.Item>
                      )}

                      {selectedListing.postedDate && (
                        <DataList.Item>
                          <DataList.ItemLabel>Posted</DataList.ItemLabel>
                          <DataList.ItemValue>{selectedListing.postedDate}</DataList.ItemValue>
                        </DataList.Item>
                      )}

                      <DataList.Item>
                        <DataList.ItemLabel>Status</DataList.ItemLabel>
                        <DataList.ItemValue>
                          <Badge
                            size="sm"
                            colorPalette={STATUS_CONFIG[selectedListing.status].colorPalette}
                          >
                            {STATUS_CONFIG[selectedListing.status].label}
                          </Badge>
                        </DataList.ItemValue>
                      </DataList.Item>

                      <DataList.Item>
                        <DataList.ItemLabel>Skills</DataList.ItemLabel>
                        <DataList.ItemValue>
                          <HStack flexWrap="wrap" gap="2">
                            {selectedListing.skills.map((skill, idx) => (
                              <Badge key={idx} size="sm" colorPalette="blue">
                                {skill}
                              </Badge>
                            ))}
                          </HStack>
                        </DataList.ItemValue>
                      </DataList.Item>

                      <DataList.Item>
                        <DataList.ItemLabel>Requirements</DataList.ItemLabel>
                        <DataList.ItemValue>
                          <VStack align="stretch" gap="1">
                            {selectedListing.requirements.length > 0 ? (
                              selectedListing.requirements.map((req, idx) => (
                                <Text key={idx} fontSize="sm">
                                  • {req}
                                </Text>
                              ))
                            ) : (
                              <Text fontSize="sm" color="gray.500">
                                No requirements listed
                              </Text>
                            )}
                          </VStack>
                        </DataList.ItemValue>
                      </DataList.Item>

                      <DataList.Item>
                        <DataList.ItemLabel>Description</DataList.ItemLabel>
                        <DataList.ItemValue>
                          <Text fontSize="sm" whiteSpace="pre-wrap">
                            {selectedListing.description}
                          </Text>
                        </DataList.ItemValue>
                      </DataList.Item>

                      <DataList.Item>
                        <DataList.ItemLabel>Job URL</DataList.ItemLabel>
                        <DataList.ItemValue>
                          <Link
                            fontSize="sm"
                            color="blue.600"
                            _dark={{ color: 'blue.400' }}
                            href={selectedListing.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            textDecoration="underline"
                          >
                            {selectedListing.url}
                          </Link>
                        </DataList.ItemValue>
                      </DataList.Item>
                    </DataList.Root>
                  </VStack>
                )}
              </Drawer.Body>

              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </Box>
  );
}
