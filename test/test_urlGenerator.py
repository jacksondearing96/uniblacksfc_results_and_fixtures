import unittest

import url_generator


class url_generatorTest(unittest.TestCase):

    def test_url_code(self):
        self.assertEqual(url_generator.GetUrlCode(2020, "Mens", "1"), "547208")
        self.assertEqual(url_generator.GetUrlCode(
            2020, "Mens", "1 Res"), "547219")
        self.assertEqual(url_generator.GetUrlCode(
            2020, "Mens", "C1"), "547209")
        self.assertEqual(url_generator.GetUrlCode(
            2020, "Mens", "C4"), "547212")
        self.assertEqual(url_generator.GetUrlCode(
            2020, "Mens", "C6"), "557892")
        self.assertEqual(url_generator.GetUrlCode(
            2020, "Mens", "C7"), "547401")
        self.assertEqual(url_generator.GetUrlCode(
            2020, "Womens", "1"), "548065")
        self.assertEqual(url_generator.GetUrlCode(
            2020, "Womens", "1 Res"), "555668")
        self.assertEqual(url_generator.GetUrlCode(
            2019, "Mens", "1"), "510206")
        self.assertEqual(url_generator.GetUrlCode(
            2018, "Womens", "1"), "522288")

    def test_url_generator(self):
        self.assertEqual(url_generator.GetUrl(2019, "Mens", "1", 1),
                         'https://websites.sportstg.com/comp_info.cgi?c=1-114-0-510206-0&a=ROUND&round=1&pool=1')

    
    def test_url_generator(self):
        FUTURE_GAME = False
        self.assertEqual(url_generator.GetUrl(2019, "Mens", "1", 1, FUTURE_GAME),
                         'https://websites.sportstg.com/comp_info.cgi?c=1-114-0-510206-0&a=FIXTURE&round=1&pool=1')