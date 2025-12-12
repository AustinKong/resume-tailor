import { Breadcrumb as ChakraBreadcrumb } from '@chakra-ui/react';
import { Fragment } from 'react';
import { Link, useLocation } from 'react-router';

import { toTitleCase } from '@/utils/text';

export default function Breadcrumb({ separator = '/ ', ...rest }) {
  const { pathname } = useLocation();
  const pathSegments = pathname.split('/').filter(Boolean);
  const pathLinks = pathSegments.map((segment, index) => {
    const to = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = toTitleCase(segment);
    return { label, to };
  });
  pathLinks.unshift({ label: 'Home', to: '/' });

  return (
    <ChakraBreadcrumb.Root {...rest}>
      <ChakraBreadcrumb.List>
        {pathLinks.map((item, index) => {
          const isLast = index === pathLinks.length - 1;
          return (
            <Fragment key={index}>
              <ChakraBreadcrumb.Item>
                {isLast ? (
                  <ChakraBreadcrumb.CurrentLink>{item.label}</ChakraBreadcrumb.CurrentLink>
                ) : (
                  <ChakraBreadcrumb.Link asChild>
                    <Link to={item.to}>{item.label}</Link>
                  </ChakraBreadcrumb.Link>
                )}
              </ChakraBreadcrumb.Item>
              {separator && !isLast && (
                <ChakraBreadcrumb.Separator>{separator}</ChakraBreadcrumb.Separator>
              )}
            </Fragment>
          );
        })}
      </ChakraBreadcrumb.List>
    </ChakraBreadcrumb.Root>
  );
}
